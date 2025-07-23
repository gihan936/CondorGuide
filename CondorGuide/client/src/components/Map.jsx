import React, { useEffect, useRef, useContext } from 'react';
import { Card, Button, Badge, Container, Row, Col, Form, InputGroup, Modal } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

const Map = () => {
  const { theme } = useContext(ThemeContext);
  const mapContainerRef = useRef();
  const mapRef = useRef();
  
  const [currentFloor, setCurrentFloor] = React.useState(2);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [is3D, setIs3D] = React.useState(true);
  const [roomData, setRoomData] = React.useState({});
  const [debugInfo, setDebugInfo] = React.useState('Loading map...');
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [isDataReady, setIsDataReady] = React.useState(false);
  const [hallwayData, setHallwayData] = React.useState({});
  const [intersectionData, setIntersectionData] = React.useState([]); // NEW: Intersection points
  
  // Cross-floor navigation state
  const [showTransportModal, setShowTransportModal] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState(null);
  const [availableTransports, setAvailableTransports] = React.useState([]);
  
  // Navigation state
  const [startRoomInput, setStartRoomInput] = React.useState('');
  const [endRoomInput, setEndRoomInput] = React.useState('');
  const [startRoom, setStartRoom] = React.useState(null);
  const [endRoom, setEndRoom] = React.useState(null);
  const [routeSearchResults, setRouteSearchResults] = React.useState({ start: [], end: [] });
  const [currentRoute, setCurrentRoute] = React.useState(null);
  const animationFrameRef = React.useRef(null);
  const [userLocation, setUserLocation] = React.useState(null);

  // Helper function to generate multiple coordinate keys with different precisions
  const generateCoordinateKeys = (lng, lat) => {
    return [
      `${lng.toFixed(6)},${lat.toFixed(6)}`,
      `${lng.toFixed(5)},${lat.toFixed(5)}`,
      `${lng.toFixed(4)},${lat.toFixed(4)}`,
      `${lng.toFixed(3)},${lat.toFixed(3)}`,
      `${lng.toFixed(2)},${lat.toFixed(2)}`
    ];
  };

  const animateRoute = () => {
    if (!currentRoute) return;

    const routeCoordinates = currentRoute.coordinates;
    const markerElement = document.createElement('div');
    markerElement.className = 'animated-marker';

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(routeCoordinates[0])
      .addTo(mapRef.current);

    let startTime = null;
    const duration = 10000; // 10 seconds for the animation

    const frame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const ratio = progress / duration;

      if (ratio < 1) {
        const routeIndex = Math.floor(ratio * (routeCoordinates.length - 1));
        const point1 = routeCoordinates[routeIndex];
        const point2 = routeCoordinates[routeIndex + 1];
        const segmentRatio = (ratio * (routeCoordinates.length - 1)) - routeIndex;

        const lng = point1[0] + (point2[0] - point1[0]) * segmentRatio;
        const lat = point1[1] + (point2[1] - point1[1]) * segmentRatio;

        marker.setLngLat([lng, lat]);
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        marker.setLngLat(routeCoordinates[routeCoordinates.length - 1]);
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  };

  // Helper function to find room data using multiple precision levels
  const findRoomData = (lng, lat, roomDataObj) => {
    const keys = generateCoordinateKeys(lng, lat);
    
    for (const key of keys) {
      if (roomDataObj[key] && Object.keys(roomDataObj[key]).length > 0) {
        return { data: roomDataObj[key], matchedKey: key };
      }
    }
    
    return { data: {}, matchedKey: null };
  };

  // Helper function to find room by name or number
  const findRoomByNameOrNumber = (searchTerm, roomDataObj) => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    const results = [];
    
    // Special debugging for problematic rooms
    if (['2a101', '2a103', '2a105'].includes(searchTermLower)) {
      // Debug logging removed for performance
    }
    
    Object.entries(roomDataObj).forEach(([key, roomData]) => {
      let match = false;
      let matchType = '';
      let matchScore = 0;

      // Check location_name (partial match, case insensitive)
      if (roomData.location_name && 
          roomData.location_name.toLowerCase().includes(searchTermLower)) {
        match = true;
        matchType = 'Name';
        matchScore = roomData.location_name.toLowerCase() === searchTermLower ? 100 : 50;
      }
      
      // Check location_numk and location_number (exact or partial match)
      const locationNumber = roomData.location_numk || roomData.location_number;
      if (locationNumber && 
          locationNumber.toString().toLowerCase().includes(searchTermLower)) {
        match = true;
        matchType = matchType ? 'Name & Number' : 'Number';
        matchScore = Math.max(matchScore, locationNumber.toString() === searchTerm.trim() ? 100 : 75);
      }

      // Check other fields for backward compatibility
      if (roomData.room_number && 
          roomData.room_number.toString().toLowerCase().includes(searchTermLower)) {
        match = true;
        matchType = matchType ? matchType + ' & Legacy' : 'Legacy Number';
        matchScore = Math.max(matchScore, 60);
      }

      if (match) {
        const coordinates = key.split(',').map(Number);
        const result = {
          key,
          data: roomData,
          matchType,
          matchScore,
          displayName: roomData.location_name || roomData.location_numk || roomData.location_number || roomData.room_number || 'Unknown',
          displayNumber: roomData.location_numk || roomData.location_number || roomData.room_number || 'N/A',
          coordinates
        };
        
        // Special debugging for problematic rooms
        if (['2a101', '2a103', '2a105'].includes(searchTermLower)) {
          // Debug logging removed for performance
        }
        
        results.push(result);
      }
    });

    // Sort by match score (highest first)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Calculate center point of a polygon
  const calculatePolygonCenter = (coordinates) => {
    if (!coordinates || !coordinates[0] || coordinates[0].length === 0) return null;
    
    const coords = coordinates[0];
    let centerLng = 0, centerLat = 0;
    coords.forEach(coord => {
      centerLng += coord[0];
      centerLat += coord[1];
    });
    return [centerLng / coords.length, centerLat / coords.length];
  };

  // Find room coordinates from room data
  const getRoomCoordinates = (roomResult) => {
    // If we have coordinates from the key, use them
    if (roomResult.coordinates && roomResult.coordinates.length === 2) {
      return roomResult.coordinates;
    }
    
    // Otherwise try to parse from the key
    const coords = roomResult.key.split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return coords;
    }
    
    return null;
  };

  // Calculate distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // NEW: Updated fetchRoomData function with intersection loading
  const fetchRoomDataWithIntersections = async () => {
    try {
      setDebugInfo('Fetching room, hallway, and intersection data...');
      
      const roomDatasetIds = [
        'cmbhf0ndq2kld1on5g332amn7',  // A-wing-level-1
        'cmclc9qq10bph1mpdk67acyag',  // B-wing-level-1
        'cmbfb8tar52id1ump75xqao9r',  // A-Wing-level-2
        'cmbhf2g8t36tf1pna7q2ed3bu',  // A-wing-level-3
        'cmcl7aad615ag1nnty7radgxw',  // B-wing-level-2
        'cmdds0tde051n1no3dr0qexzj'   // level-2-locations - unified room polygons
      ];
      
      // Multi-floor dataset configuration
      const floorDatasets = {
        1: {
          hallways: { unified: 'cmdf1nfj62mec1olkucr6oc7j' }, // level-1-hallways
          intersections: { unified: 'cmdfgxcsm2fg21omz3bv513m6' } // level-1-intersections
        },
        2: {
          hallways: { unified: 'cmcmdryk90m2n1oo72ki4jmxm' }, // level-2-hallways
          intersections: { unified: 'cmd8a5ftc1q041mmnh8cjcygr' } // level-2-intersections
        },
        3: {
          hallways: { 
            'a-wing': 'cmddz5p8m1ryn1nmzbl5fin5x', // A-wing-level-3-hallways
            'b-wing': 'cmdfgxzxs15yr1oru73um6pd4'  // B-wing-level-3-hallways
          },
          intersections: { 
            'a-wing': 'cmdenrd6u05o71ote2vk9zg9x', // A-wing-level-3-intersections
            'b-wing': 'cmdfhc7h70str1oo3ij73mj4e'  // B-wing-level-3-intersections
          }
        }
      };
      
      const allRoomData = {};
      const allHallwayData = {};
      
      // Load room polygon data
      for (const datasetId of roomDatasetIds) {
        try {
          const response = await fetch(`https://api.mapbox.com/datasets/v1/kushadini/${datasetId}/features?access_token=${mapboxgl.accessToken}`);
          if (response.ok) {
            const data = await response.json();
            
            data.features.forEach(feature => {
              if (feature.geometry && feature.properties && feature.geometry.type === 'Polygon') {
                const centerCoords = calculatePolygonCenter(feature.geometry.coordinates);
                if (centerCoords) {
                  const keys = generateCoordinateKeys(centerCoords[0], centerCoords[1]);
                  keys.forEach(key => {
                    // Detect floor from room name/number (e.g., "2A101" -> floor 2, "3B201" -> floor 3)
                    let detectedFloor = 2; // default
                    const roomIdentifier = feature.properties.room_name || feature.properties.name || feature.properties.room_number || feature.properties.location_name || feature.properties.location_number;
                    if (roomIdentifier) {
                      const floorMatch = roomIdentifier.match(/^(\d+)[ABC]/);
                      if (floorMatch) {
                        detectedFloor = parseInt(floorMatch[1]);
                      }
                    }
                    
                    // Determine dataset name based on ID
                    let datasetName = 'unknown';
                    switch(datasetId) {
                      case 'cmbhf0ndq2kld1on5g332amn7': datasetName = 'A-wing-level-1'; break;
                      case 'cmclc9qq10bph1mpdk67acyag': datasetName = 'B-wing-level-1'; break;
                      case 'cmbfb8tar52id1ump75xqao9r': datasetName = 'A-Wing-level-2'; break;
                      case 'cmbhf2g8t36tf1pna7q2ed3bu': datasetName = 'A-wing-level-3'; break;
                      case 'cmcl7aad615ag1nnty7radgxw': datasetName = 'B-wing-level-2'; break;
                      case 'cmdds0tde051n1no3dr0qexzj': datasetName = 'level-2-locations'; break;
                      case 'cmdg1erdc0pqw1mteg8j4tepp': datasetName = 'level-1-locations'; break;
                      default: datasetName = datasetId;
                    }
                    
                    allRoomData[key] = {
                      ...feature.properties,
                      center_coordinates: centerCoords,
                      geometry: feature.geometry,
                      floor: feature.properties.floor || detectedFloor,
                      dataset_id: datasetId,
                      dataset_name: datasetName
                    };
                  });
                }
              }
            });
          }
        } catch (err) {
        }
      }
      
      // Load hallway and intersection data for all floors
      let allIntersectionPoints = [];
      
      
      for (const [floor, datasets] of Object.entries(floorDatasets)) {
        
        // Load hallway data for this floor
        const hallwayIds = datasets.hallways.unified ? 
          { unified: datasets.hallways.unified } : 
          { 'a-wing': datasets.hallways['a-wing'], 'b-wing': datasets.hallways['b-wing'] };
          
        for (const [wingKey, datasetId] of Object.entries(hallwayIds)) {
          try {
            const response = await fetch(`https://api.mapbox.com/datasets/v1/kushadini/${datasetId}/features?access_token=${mapboxgl.accessToken}`);
            if (response.ok) {
              const data = await response.json();
              
              data.features.forEach(feature => {
                if (feature.geometry && feature.properties && feature.geometry.type === 'LineString') {
                  const hallwayId = feature.properties.hallway_id;
                  if (hallwayId) {
                    // Ensure floor property is set correctly
                    feature.properties.floor = parseInt(floor);
                    
                    // For floors with separate wing datasets, include wing information in the key
                    let floorHallwayId;
                    if (wingKey !== 'unified') {
                      // Extract wing from wingKey (a-wing or b-wing)
                      const wing = wingKey.split('-')[0].toUpperCase(); // 'a-wing' -> 'A'
                      floorHallwayId = `${floor}-${wing}${hallwayId}`;
                    } else {
                      floorHallwayId = `${floor}-${hallwayId}`;
                    }
                    
                    if (!allHallwayData[floorHallwayId]) {
                      allHallwayData[floorHallwayId] = [];
                    }
                    allHallwayData[floorHallwayId].push(feature);
                    
                  }
                }
              });
            }
          } catch (err) {
          }
        }
        
        // Load intersection data for this floor
        const intersectionIds = datasets.intersections.unified ? 
          { unified: datasets.intersections.unified } : 
          { 'a-wing': datasets.intersections['a-wing'], 'b-wing': datasets.intersections['b-wing'] };
          
        for (const [wingKey, datasetId] of Object.entries(intersectionIds)) {
          try {
            const response = await fetch(`https://api.mapbox.com/datasets/v1/kushadini/${datasetId}/features?access_token=${mapboxgl.accessToken}`);
            if (response.ok) {
              const data = await response.json();
              
              data.features.forEach(feature => {
                if (feature.geometry && 
                    feature.geometry.type === 'Point' && 
                    feature.properties &&
                    feature.properties.intersection_id &&
                    feature.properties.intersection_type &&
                    feature.geometry.coordinates &&
                    feature.geometry.coordinates.length === 2 &&
                    !isNaN(feature.geometry.coordinates[0]) &&
                    !isNaN(feature.geometry.coordinates[1])) {
                  
                  allIntersectionPoints.push({
                    id: feature.properties.intersection_id,
                    coordinates: feature.geometry.coordinates,
                    type: feature.properties.intersection_type,
                    wing: feature.properties.wing || 'Unknown',
                    floor: parseInt(floor),
                    description: feature.properties.description || feature.properties.intersection_id,
                    location_id: feature.properties.location_id,
                    properties: feature.properties,
                    connections: [] // Will be auto-generated
                  });
                } else {
                }
              });
            }
          } catch (err) {
          }
        }
      }
      
      // Build automatic connections between intersection points
      if (allIntersectionPoints.length > 0) {
        const roomPolygons = Object.values(allRoomData)
          .filter(room => room.geometry && room.geometry.type === 'Polygon')
          .map(room => room.geometry);
        
        const hallwaySegments = [];
        Object.values(allHallwayData).forEach(segments => {
          hallwaySegments.push(...segments);
        });
        
        // Build connections for each floor separately to maintain floor isolation
        const floorIntersections = {};
        allIntersectionPoints.forEach(point => {
          if (!floorIntersections[point.floor]) {
            floorIntersections[point.floor] = [];
          }
          floorIntersections[point.floor].push(point);
        });
        
        
        // Build connections within each floor
        for (const [floor, points] of Object.entries(floorIntersections)) {
          
          const floorHallwaySegments = hallwaySegments.filter(segment => 
            segment.properties && segment.properties.floor == floor
          );
          
          // Filter room polygons to only include rooms on the current floor using dataset info
          const floorRoomPolygons = roomPolygons.filter(polygon => {
            // Get room data to check floor and dataset
            const roomEntry = Object.values(allRoomData).find(room => 
              room.geometry === polygon
            );
            
            if (!roomEntry) return false;
            
            // Use both floor detection and dataset filtering for precise floor isolation
            const roomFloor = roomEntry.floor;
            const datasetId = roomEntry.dataset_id;
            
            // Define which datasets belong to which floors
            const floorDatasets = {
              1: ['cmbhf0ndq2kld1on5g332amn7', 'cmclc9qq10bph1mpdk67acyag', 'cmdg1erdc0pqw1mteg8j4tepp'], // A-wing-1, B-wing-1, unified-1
              2: ['cmbfb8tar52id1ump75xqao9r', 'cmcl7aad615ag1nnty7radgxw', 'cmdds0tde051n1no3dr0qexzj'], // A-wing-2, B-wing-2, unified-2
              3: ['cmbhf2g8t36tf1pna7q2ed3bu', 'cmcldrhyu04rx1olrhjjbm33r'] // A-wing-3, B-wing-3
            };
            
            const expectedDatasets = floorDatasets[floor] || [];
            return roomFloor == floor && expectedDatasets.includes(datasetId);
          });
          
          
          floorIntersections[floor] = buildAutoConnections(points, floorRoomPolygons, floorHallwaySegments);
          
        }
        
        // Combine all floor intersections back
        allIntersectionPoints = Object.values(floorIntersections).flat();
        
        // Add inter-floor connections for stairs and elevators
        allIntersectionPoints = addInterFloorConnections(allIntersectionPoints);
      }
      
      setRoomData(allRoomData);
      setHallwayData(allHallwayData);
      setIntersectionData(allIntersectionPoints);
      
      
      // Debug hallway data for floors 1 and 3
      // Log intersections by floor
      const floorCounts = {};
      allIntersectionPoints.forEach(point => {
        floorCounts[point.floor] = (floorCounts[point.floor] || 0) + 1;
      });
      
      
      setDebugInfo(`Multi-floor data loaded: ${Object.keys(allRoomData).length} rooms, ${allIntersectionPoints.length} intersections across ${Object.keys(floorCounts).length} floors`);
      setIsDataReady(true);
      
    } catch (error) {
      setDebugInfo('Error loading data');
      setIsDataReady(true);
    }
  };

  // NEW: Auto-connection building function
  const buildAutoConnections = (intersectionPoints, roomPolygons, hallwaySegments) => {
    
    // Enhanced connection rules based on intersection types
    const connectionRules = {
      'room_entrance': {
        maxDistance: 50, // Back to original value that worked on floor 2
        connectTo: ['corridor_turn', 'corridor_junction', 'room_entrance'],
        priority: 'medium',
        bias: 1.0
      },
      'corridor_turn': {
        maxDistance: 80, // Back to original value that worked on floor 2
        connectTo: ['corridor_turn', 'corridor_junction', 'room_entrance', 'staircase_entrance', 'elevator_entrance'],
        priority: 'high',
        bias: 0.8 // Prefer turns for navigation
      },
      'corridor_junction': {
        maxDistance: 100, // Back to original value that worked on floor 2
        connectTo: ['corridor_junction', 'corridor_turn', 'staircase_entrance', 'elevator_entrance', 'room_entrance'],
        priority: 'high',
        bias: 0.7 // Highly prefer junctions
      },
      'staircase_entrance': {
        maxDistance: 60, // Back to original value that worked on floor 2
        connectTo: ['corridor_turn', 'corridor_junction', 'staircase_entrance'],
        priority: 'high',
        bias: 1.1 // Slight penalty for stairs
      },
      'elevator_entrance': {
        maxDistance: 60, // Back to original value that worked on floor 2
        connectTo: ['corridor_turn', 'corridor_junction', 'elevator_entrance'],
        priority: 'high',
        bias: 1.0
      }
    };
    
    // Clear existing connections
    intersectionPoints.forEach(point => {
      point.connections = [];
    });
    
    // Build connections between each pair of points
    for (let i = 0; i < intersectionPoints.length; i++) {
      for (let j = i + 1; j < intersectionPoints.length; j++) {
        const point1 = intersectionPoints[i];
        const point2 = intersectionPoints[j];
        
        // Validate intersection points have required properties
        if (!point1.id || !point1.coordinates || !point1.type || 
            !point2.id || !point2.coordinates || !point2.type ||
            point1.coordinates.length !== 2 || point2.coordinates.length !== 2) {
          continue;
        }
        
        // Check if these point types should connect
        const rule1 = connectionRules[point1.type];
        const rule2 = connectionRules[point2.type];
        
        if (!rule1 || !rule2) {
          continue;
        }
        
        // Check if point types are compatible
        const canConnect = (
          rule1.connectTo.includes(point2.type) || 
          rule2.connectTo.includes(point1.type)
        );
        
        if (!canConnect) {
          continue;
        }
        
        // Special handling for cross-wing connections
        const isCrossWing = point1.wing !== point2.wing;
        let crossWingMultiplier = 1.0;
        
        if (isCrossWing) {
          // For cross-wing connections, prioritize junctions, stairs, and elevators
          const crossWingTypes = ['corridor_junction', 'staircase_entrance', 'elevator_entrance'];
          const point1IsCrossWingType = crossWingTypes.includes(point1.type);
          const point2IsCrossWingType = crossWingTypes.includes(point2.type);
          
          if (point1IsCrossWingType || point2IsCrossWingType) {
            crossWingMultiplier = 1.5; // Increase max distance for cross-wing connections
            } else {
            // For non-junction cross-wing connections, be more restrictive
            crossWingMultiplier = 0.7;
          }
        }
        
        // Check distance - use the maximum of both rules to be more permissive
        const distance = calculateDistance(point1.coordinates, point2.coordinates);
        const maxDistance = Math.max(rule1.maxDistance, rule2.maxDistance) * crossWingMultiplier;
        
        if (distance > maxDistance) {
          continue;
        }
        
        // Check if path is clear (no room polygon intersections)
        // Be more lenient for corridor_turn to corridor_turn connections and cross-wing connections
        const isCorridorToCorridorConnection = point1.type === 'corridor_turn' && point2.type === 'corridor_turn';
        let pathIsClear;
        
        if (isCorridorToCorridorConnection || isCrossWing) {
          // For corridor turns and cross-wing connections, use a very permissive check
          pathIsClear = isPathClearOfRooms(point1.coordinates, point2.coordinates, roomPolygons, 0.05);
        } else {
          // For other connections, use normal clearance check
          pathIsClear = isPathClearOfRooms(point1.coordinates, point2.coordinates, roomPolygons);
        }
        
        if (!pathIsClear) {
          continue;
        }
        
        // Create bidirectional connection with bias-adjusted weights
        const baseCost = distance;
        const weight1to2 = baseCost * (rule2.bias || 1.0);
        const weight2to1 = baseCost * (rule1.bias || 1.0);
        
        point1.connections.push({
          targetId: point2.id,
          targetIndex: j,
          distance: distance,
          weight: weight1to2,
          pathType: `${point1.type}-to-${point2.type}`
        });
        
        point2.connections.push({
          targetId: point1.id,
          targetIndex: i,
          distance: distance,
          weight: weight2to1,
          pathType: `${point2.type}-to-${point1.type}`
        });
        
      }
    }
    
    // Fallback 1: Ensure corridor_turn points are well connected
    const corridorTurnPoints = intersectionPoints.filter(p => p.type === 'corridor_turn');
    const poorlyConnectedTurns = corridorTurnPoints.filter(p => p.connections.length < 2);
    
    if (poorlyConnectedTurns.length > 0) {
      
      poorlyConnectedTurns.forEach((point, idx) => {
        const pointIndex = intersectionPoints.indexOf(point);
        
        // Find nearest corridor_turn or corridor_junction points
        const nearbyPoints = intersectionPoints
          .map((otherPoint, otherIndex) => ({
            point: otherPoint,
            index: otherIndex,
            distance: calculateDistance(point.coordinates, otherPoint.coordinates)
          }))
          .filter(item => 
            item.index !== pointIndex && 
            (item.point.type === 'corridor_turn' || item.point.type === 'corridor_junction') &&
            item.distance <= 100 // Extended range for fallback
          )
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3); // Connect to 3 nearest points
          
        nearbyPoints.forEach(nearbyItem => {
          // Check if connection already exists
          const alreadyConnected = point.connections.some(conn => conn.targetIndex === nearbyItem.index);
          if (!alreadyConnected) {
            const weight = nearbyItem.distance * 1.2; // Slight penalty for fallback
            
            point.connections.push({
              targetIndex: nearbyItem.index,
              distance: nearbyItem.distance,
              weight: weight,
              pathType: 'enhanced-corridor-connection'
            });
            
            nearbyItem.point.connections.push({
              targetIndex: pointIndex,
              distance: nearbyItem.distance,
              weight: weight,
              pathType: 'enhanced-corridor-connection'
            });
            
          }
        });
      });
    }
    
    // Fallback 2: Ensure cross-wing connectivity
    const aWingPoints = intersectionPoints.filter(p => p.wing && p.wing.toLowerCase().includes('a'));
    const bWingPoints = intersectionPoints.filter(p => p.wing && p.wing.toLowerCase().includes('b'));
    
    if (aWingPoints.length > 0 && bWingPoints.length > 0) {
      
      // Find the closest junction/stair/elevator points between wings
      const crossWingCandidateTypes = ['corridor_junction', 'staircase_entrance', 'elevator_entrance'];
      const aWingCandidates = aWingPoints.filter(p => crossWingCandidateTypes.includes(p.type));
      const bWingCandidates = bWingPoints.filter(p => crossWingCandidateTypes.includes(p.type));
      
      // Ensure at least one cross-wing connection exists
      let crossWingConnections = 0;
      intersectionPoints.forEach(point => {
        point.connections.forEach(conn => {
          const targetPoint = intersectionPoints.find(p => p.id === conn.targetId);
          if (targetPoint && point.wing !== targetPoint.wing) {
            crossWingConnections++;
          }
        });
      });
      
      if (crossWingConnections === 0) {
        
        // Create emergency connections between closest candidates
        let minDistance = Infinity;
        let bestA = null, bestB = null;
        
        (aWingCandidates.length > 0 ? aWingCandidates : aWingPoints).forEach(aPoint => {
          (bWingCandidates.length > 0 ? bWingCandidates : bWingPoints).forEach(bPoint => {
            const distance = calculateDistance(aPoint.coordinates, bPoint.coordinates);
            if (distance < minDistance) {
              minDistance = distance;
              bestA = aPoint;
              bestB = bPoint;
            }
          });
        });
        
        if (bestA && bestB && minDistance <= 200) { // Emergency distance limit
          const aIndex = intersectionPoints.indexOf(bestA);
          const bIndex = intersectionPoints.indexOf(bestB);
          const weight = minDistance * 2.0; // Higher weight for emergency connections
          
          bestA.connections.push({
            targetId: bestB.id,
            targetIndex: bIndex,
            distance: minDistance,
            weight: weight,
            pathType: 'emergency-cross-wing'
          });
          
          bestB.connections.push({
            targetId: bestA.id,
            targetIndex: aIndex,
            distance: minDistance,
            weight: weight,
            pathType: 'emergency-cross-wing'
          });
          
        }
      } else {
      }
    }
    
    // Fallback 3: If no connections were made at all, create basic distance-based connections
    const totalConnections = intersectionPoints.reduce((sum, point) => sum + point.connections.length, 0);
    if (totalConnections === 0) {
      
      // Create connections based purely on distance without room polygon checking
      for (let i = 0; i < intersectionPoints.length; i++) {
        for (let j = i + 1; j < intersectionPoints.length; j++) {
          const point1 = intersectionPoints[i];
          const point2 = intersectionPoints[j];
          const distance = calculateDistance(point1.coordinates, point2.coordinates);
          
          // Connect nearby points (within 80m) regardless of room polygons
          if (distance <= 80) {
            const weight = distance * 1.5; // Higher weight for fallback connections
            
            point1.connections.push({
              targetIndex: j,
              distance: distance,
              weight: weight,
              pathType: 'fallback-connection'
            });
            
            point2.connections.push({
              targetIndex: i,
              distance: distance,
              weight: weight,
              pathType: 'fallback-connection'
            });
          }
        }
      }
    }
    
    // Log connection summary
    intersectionPoints.forEach(point => {
    });
    
    return intersectionPoints;
  };

  // NEW: Add inter-floor connections for stairs and elevators
  const addInterFloorConnections = (intersectionPoints) => {
    
    // Group intersections by location_id (stairs/elevators with same location_id are connected vertically)
    const locationGroups = {};
    intersectionPoints.forEach(point => {
      if (point.location_id && (point.type === 'staircase_entrance' || point.type === 'elevator_entrance')) {
        if (!locationGroups[point.location_id]) {
          locationGroups[point.location_id] = [];
        }
        locationGroups[point.location_id].push(point);
      }
    });
    
    // Add connections between floors for each location group
    Object.entries(locationGroups).forEach(([locationId, points]) => {
      if (points.length > 1) {
        
        // Connect each point to all other points in different floors
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const point1 = points[i];
            const point2 = points[j];
            
            if (point1.floor !== point2.floor) {
              // Calculate weight based on floor difference (higher floors = more weight)
              const floorDifference = Math.abs(point1.floor - point2.floor);
              const weight = floorDifference * 10; // Base weight of 10 per floor
              
              // Add bidirectional connections
              point1.connections.push({
                targetId: point2.id,
                weight: weight,
                type: 'inter_floor',
                transport_type: point1.type === 'staircase_entrance' ? 'stairs' : 'elevator'
              });
              
              point2.connections.push({
                targetId: point1.id,
                weight: weight,
                type: 'inter_floor',
                transport_type: point2.type === 'staircase_entrance' ? 'stairs' : 'elevator'
              });
              
            }
          }
        }
      }
    });
    
    const totalInterFloorConnections = Object.values(locationGroups)
      .filter(group => group.length > 1)
      .reduce((sum, group) => sum + (group.length * (group.length - 1)), 0);
      
    
    return intersectionPoints;
  };

  // Simplified path clearance checking - only avoid room interiors
  const isPathClearOfRooms = (startCoords, endCoords, roomPolygons, bufferDistance = 0.1) => {
    const checkPoints = 20; // Check 20 points along the line for better precision
    
    for (let i = 1; i < checkPoints; i++) { // Skip start/end points (i=0 and i=checkPoints)
      const t = i / checkPoints;
      const checkPoint = [
        startCoords[0] + t * (endCoords[0] - startCoords[0]),
        startCoords[1] + t * (endCoords[1] - startCoords[1])
      ];
      
      // Only check if point is inside room polygons (not near boundaries)
      for (const roomPolygon of roomPolygons) {
        if (isPointInPolygon(checkPoint, roomPolygon)) {
          return false;
        }
      }
    }
    
    return true;
  };

  // NEW: Check if point is in polygon
  const isPointInPolygon = (point, polygon) => {
    const [x, y] = point;
    const coords = polygon.coordinates[0]; // Get exterior ring
    let inside = false;
    
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const [xi, yi] = coords[i];
      const [xj, yj] = coords[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // NEW: Check if point is too close to room boundary
  const isPointTooCloseToRoomBoundary = (point, roomPolygon, bufferDistance) => {
    const polygonCoords = roomPolygon.coordinates[0];
    
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
      const edgeStart = polygonCoords[j];
      const edgeEnd = polygonCoords[i];
      const distanceToEdge = distanceFromPointToLineSegment(point, edgeStart, edgeEnd);
      
      if (distanceToEdge < bufferDistance) {
        return true;
      }
    }
    
    return false;
  };

  // NEW: Distance from point to line segment
  const distanceFromPointToLineSegment = (point, lineStart, lineEnd) => {
    const A = point[0] - lineStart[0];
    const B = point[1] - lineStart[1];
    const C = lineEnd[0] - lineStart[0];
    const D = lineEnd[1] - lineStart[1];

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = lineStart[0];
      yy = lineStart[1];
    } else if (param > 1) {
      xx = lineEnd[0];
      yy = lineEnd[1];
    } else {
      xx = lineStart[0] + param * C;
      yy = lineStart[1] + param * D;
    }

    const dx = point[0] - xx;
    const dy = point[1] - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // NEW: Generate corridor waypoints between two intersections
  const generateCorridorWaypoints = (startCoords, endCoords, roomPolygons) => {
    const waypoints = [];
    const steps = 8; // Number of intermediate waypoints
    const offset = 0.5; // Meters to offset from room boundaries
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      let waypoint = [
        startCoords[0] + t * (endCoords[0] - startCoords[0]),
        startCoords[1] + t * (endCoords[1] - startCoords[1])
      ];
      
      // Check if waypoint is inside any room, if so, find nearest corridor point
      let adjustedWaypoint = findNearestCorridorPoint(waypoint, roomPolygons, offset);
      
      if (adjustedWaypoint) {
        // Verify the adjusted waypoint is still reasonable
        const distanceFromOriginal = calculateDistance(waypoint, adjustedWaypoint);
        if (distanceFromOriginal < 5) { // Max 5 meter adjustment
          waypoints.push(adjustedWaypoint);
        } else {
          // If adjustment is too large, skip this waypoint
        }
      }
    }
    
    return waypoints;
  };

  // NEW: Find nearest point in corridor (outside all room polygons)
  const findNearestCorridorPoint = (point, roomPolygons, offset) => {
    // Check if point is already in a corridor
    const isInRoom = roomPolygons.some(polygon => isPointInPolygon(point, polygon));
    
    if (!isInRoom) {
      return point; // Already in corridor
    }
    
    // Find the nearest room edge and move perpendicular away from it
    let closestEdgeDistance = Infinity;
    let bestAdjustedPoint = null;
    
    roomPolygons.forEach(polygon => {
      if (isPointInPolygon(point, polygon)) {
        const polygonCoords = polygon.coordinates[0];
        
        for (let i = 0; i < polygonCoords.length - 1; i++) {
          const edgeStart = polygonCoords[i];
          const edgeEnd = polygonCoords[i + 1];
          const distanceToEdge = distanceFromPointToLineSegment(point, edgeStart, edgeEnd);
          
          if (distanceToEdge < closestEdgeDistance) {
            closestEdgeDistance = distanceToEdge;
            
            // Calculate perpendicular direction away from edge
            const edgeVector = [edgeEnd[0] - edgeStart[0], edgeEnd[1] - edgeStart[1]];
            const edgeLength = Math.sqrt(edgeVector[0] * edgeVector[0] + edgeVector[1] * edgeVector[1]);
            const edgeNormal = [-edgeVector[1] / edgeLength, edgeVector[0] / edgeLength];
            
            // Try both directions of the normal
            const candidate1 = [
              point[0] + edgeNormal[0] * offset,
              point[1] + edgeNormal[1] * offset
            ];
            const candidate2 = [
              point[0] - edgeNormal[0] * offset,
              point[1] - edgeNormal[1] * offset
            ];
            
            // Choose the candidate that's outside the room
            if (!isPointInPolygon(candidate1, polygon)) {
              bestAdjustedPoint = candidate1;
            } else if (!isPointInPolygon(candidate2, polygon)) {
              bestAdjustedPoint = candidate2;
            }
          }
        }
      }
    });
    
    return bestAdjustedPoint || point;
  };

  // NEW: Smooth navigation path by removing redundant waypoints
  const smoothNavigationPath = (coordinates) => {
    if (coordinates.length <= 2) return coordinates;
    
    const smoothed = [coordinates[0]];
    
    for (let i = 1; i < coordinates.length - 1; i++) {
      const prev = coordinates[i - 1];
      const current = coordinates[i];
      const next = coordinates[i + 1];
      
      // Calculate angle between prev->current and current->next
      const angle1 = Math.atan2(current[1] - prev[1], current[0] - prev[0]);
      const angle2 = Math.atan2(next[1] - current[1], next[0] - current[0]);
      const angleDiff = Math.abs(angle1 - angle2);
      const normalizedAngle = Math.min(angleDiff, 2 * Math.PI - angleDiff);
      
      // If angle change is significant (> 10 degrees), keep the waypoint
      if (normalizedAngle > Math.PI / 18) {
        smoothed.push(current);
      }
      
      // Always keep waypoints that are far apart
      const distToPrev = calculateDistance(current, prev);
      const distToNext = calculateDistance(current, next);
      if (distToPrev > 10 || distToNext > 10) {
        if (!smoothed.includes(current)) {
          smoothed.push(current);
        }
      }
    }
    
    smoothed.push(coordinates[coordinates.length - 1]);
    
    // Remove duplicates
    return smoothed.filter((coord, index) => {
      if (index === 0) return true;
      const prevCoord = smoothed[index - 1];
      const distance = calculateDistance(coord, prevCoord);
      return distance > 1; // Remove points less than 1 meter apart
    });
  };

  // NEW: Enhanced room search that uses intersection points
  const searchRoomsWithIntersections = (searchTerm, isStart = true) => {
    if (!searchTerm.trim()) {
      if (isStart) {
        setRouteSearchResults(prev => ({ ...prev, start: [] }));
      } else {
        setRouteSearchResults(prev => ({ ...prev, end: [] }));
      }
      return;
    }

    // First try to find intersection points that match special location types
    const knownLocationTypes = ['staircase', 'elevator', 'stairs'];
    const searchTermLower = searchTerm.toLowerCase().trim();

    let results = [];

    // Check if searching for special locations (stairs, elevators)
    if (knownLocationTypes.some(type => searchTermLower.includes(type))) {
      intersectionData.forEach(intersection => {
        const typeMatch = intersection.type.toLowerCase().includes(searchTermLower) ||
                         intersection.description.toLowerCase().includes(searchTermLower);
        
        if (typeMatch) {
          results.push({
            key: intersection.id,
            data: intersection,
            matchType: 'Intersection',
            matchScore: 100,
            displayName: intersection.description,
            displayNumber: intersection.id.split('_').pop(), // Get number from ID
            coordinates: intersection.coordinates,
            isIntersection: true
          });
        }
      });
    }

    // If no intersection matches, search rooms normally
    if (results.length === 0) {
      results = findRoomByNameOrNumber(searchTerm, roomData);
      
      // For room results, try to find their entrance intersection point
      results = results.map(result => {
        const roomLocationId = result.data.location_id;
        const entranceIntersection = intersectionData.find(intersection => 
          intersection.location_id === roomLocationId && 
          intersection.type === 'room_entrance'
        );
        
        if (entranceIntersection) {
          return {
            ...result,
            coordinates: entranceIntersection.coordinates, // Use entrance coordinates
            intersectionId: entranceIntersection.id,
            isIntersection: true
          };
        }
        
        return result; // Use room center if no entrance found
      });
    }
    
    const limitedResults = results.slice(0, 5);

    if (isStart) {
      setRouteSearchResults(prev => ({ ...prev, start: limitedResults }));
    } else {
      setRouteSearchResults(prev => ({ ...prev, end: limitedResults }));
    }
  };

  // Select room for navigation
  const selectRoomForNavigation = (roomResult, isStart = true) => {
    
    const coordinates = getRoomCoordinates(roomResult);
    
    if (!coordinates) {
      setDebugInfo('Could not determine room coordinates');
      return;
    }

    // Ensure floor information is properly included
    const roomInfo = {
      ...roomResult,
      coordinates,
      floor: roomResult.data?.floor || roomResult.floor,
      name: roomResult.displayName || roomResult.data?.room_name || roomResult.data?.name
    };
    

    if (isStart) {
      setStartRoom(roomInfo);
      setStartRoomInput(roomResult.displayName);
      setRouteSearchResults(prev => ({ ...prev, start: [] }));
      // Only highlight if room is on current floor
      if (roomInfo.floor === currentFloor) {
        highlightRoom(coordinates, 'start');
      } else {
      }
    } else {
      setEndRoom(roomInfo);
      setEndRoomInput(roomResult.displayName);
      setRouteSearchResults(prev => ({ ...prev, end: [] }));
      // Only highlight if room is on current floor
      if (roomInfo.floor === currentFloor) {
        highlightRoom(coordinates, 'end');
      } else {
      }
    }

  };

  // Highlight selected room on map
  const highlightRoom = (coordinates, type) => {
    const sourceId = `highlighted-room-${type}`;
    const layerId = `highlighted-room-${type}-layer`;
    
    // Remove existing highlight
    if (mapRef.current.getLayer(layerId)) {
      mapRef.current.removeLayer(layerId);
    }
    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.removeSource(sourceId);
    }

    // Add new highlight
    mapRef.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        }
      }
    });

    mapRef.current.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 15,
        'circle-color': type === 'start' ? '#00FF00' : '#FF0000',
        'circle-opacity': 0.7,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 3
      }
    });
  };

  // NEW: Find closest intersection to a coordinate
  const findClosestIntersection = (coordinates, intersections, maxDistance = 50) => {
    let closestIntersection = null;
    let minDistance = Infinity;
    const candidateDistances = [];
    
    intersections.forEach(intersection => {
      const distance = calculateDistance(coordinates, intersection.coordinates);
      candidateDistances.push({ id: intersection.id, distance: distance.toFixed(1) });
      
      if (distance < minDistance && distance < maxDistance) {
        minDistance = distance;
        closestIntersection = intersection;
      }
    });
    
    // Sort candidates by distance to see the closest ones
    candidateDistances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
    if (!closestIntersection) {
      
      // Try with expanded radius for isolated rooms like 2A101, 2A103, 2A105
      const expandedMaxDistance = 100; // Double the search radius
      let expandedMinDistance = Infinity; // Reset minDistance for expanded search
      intersections.forEach(intersection => {
        const distance = calculateDistance(coordinates, intersection.coordinates);
        if (distance < expandedMinDistance && distance < expandedMaxDistance) {
          expandedMinDistance = distance;
          closestIntersection = intersection;
        }
      });
      
      if (closestIntersection) {
        minDistance = expandedMinDistance; // Update minDistance for logging
      }
      
      if (closestIntersection) {
      } else {
        
        // For rooms 2A101, 2A103, 2A105, try an even larger radius as last resort
        const veryExpandedMaxDistance = 200; // Even larger search radius
        let veryExpandedMinDistance = Infinity;
        intersections.forEach(intersection => {
          const distance = calculateDistance(coordinates, intersection.coordinates);
          if (distance < veryExpandedMinDistance && distance < veryExpandedMaxDistance) {
            veryExpandedMinDistance = distance;
            closestIntersection = intersection;
          }
        });
        
        if (closestIntersection) {
          minDistance = veryExpandedMinDistance;
        } else {
        }
      }
    } else {
    }
    
    return closestIntersection;
  };

  // NEW: A* pathfinding algorithm with detailed debugging
  const findShortestIntersectionPath = (startIntersection, endIntersection, intersections) => {
    
    if (startIntersection.id === endIntersection.id) {
      return [startIntersection];
    }
    
    // Check if this is cross-wing pathfinding
    const isCrossWing = startIntersection.wing !== endIntersection.wing;
    if (isCrossWing) {
      
      // Check if start has any cross-wing connections
      const startCrossWingConns = startIntersection.connections.filter(conn => {
        const target = intersections.find(i => i.id === conn.targetId);
        return target && target.wing !== startIntersection.wing;
      });
      
      // Check if end has any cross-wing connections  
      const endCrossWingConns = endIntersection.connections.filter(conn => {
        const target = intersections.find(i => i.id === conn.targetId);
        return target && target.wing !== endIntersection.wing;
      });
    }
    
    // A* algorithm implementation
    const openSet = new Set([startIntersection.id]);
    const closedSet = new Set();
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    
    // Initialize scores
    intersections.forEach(intersection => {
      gScore[intersection.id] = intersection.id === startIntersection.id ? 0 : Infinity;
      fScore[intersection.id] = intersection.id === startIntersection.id ? 
        calculateDistance(startIntersection.coordinates, endIntersection.coordinates) : Infinity;
    });
    
    let iterations = 0;
    const maxIterations = 1000; // Safety limit
    
    while (openSet.size > 0 && iterations < maxIterations) {
      iterations++;
      
      // Find node with lowest fScore
      let currentId = null;
      let minFScore = Infinity;
      for (const id of openSet) {
        if (fScore[id] < minFScore) {
          minFScore = fScore[id];
          currentId = id;
        }
      }
      
      if (currentId === null) {
        break;
      }
      
      // If we reached the goal
      if (currentId === endIntersection.id) {
        const path = [];
        let current = endIntersection.id;
        while (current !== undefined) {
          const intersection = intersections.find(i => i.id === current);
          path.unshift(intersection);
          current = cameFrom[current];
        }
        if (isCrossWing) {
        } else {
        }
        return path;
      }
      
      openSet.delete(currentId);
      closedSet.add(currentId);
      
      const currentIntersection = intersections.find(i => i.id === currentId);
      if (!currentIntersection) {
        continue;
      }
      
      let validNeighborsExamined = 0;
      let crossWingNeighborsFound = 0;
      
      // Examine neighbors
      currentIntersection.connections.forEach((connection, connIndex) => {
        const neighborId = connection.targetId;
        
        if (closedSet.has(neighborId)) return;
        
        const neighbor = intersections.find(i => i.id === neighborId);
        if (!neighbor) {
          // Skip inter-floor connections during floor-specific pathfinding
          if (connection.type === 'inter_floor') {
            // This is expected for floor-specific pathfinding
            if (iterations === 1) {
            }
            return;
          }
          if (iterations === 1) { // Only log once to avoid spam
          }
          return;
        }
        
        // AVOID other room entrances (only allow start/end room entrances)
        // EXCEPT for emergency connections which are allowed to connect to isolated room entrances
        if (neighbor.type === 'room_entrance' && 
            neighbor.id !== startIntersection.id && 
            neighbor.id !== endIntersection.id &&
            !(connection.pathType && connection.pathType.includes('emergency'))) {
          // Skip this room entrance - we don't want to route through other rooms
          if (connection.pathType && connection.pathType.includes('emergency')) {
          }
          return;
        }
        
        validNeighborsExamined++;
        if (isCrossWing && neighbor.wing !== currentIntersection.wing) {
          crossWingNeighborsFound++;
        }
        
        
        // Skip path clearance check for cross-wing debugging
        if (isCrossWing) {
          // Skip clearance check to see if that's the issue
        } else {
          // Normal path clearance check for intra-wing
          const pathClear = isPathClearOfRooms(
            currentIntersection.coordinates,
            neighbor.coordinates,
            Object.values(roomData)
              .filter(room => room.geometry && room.geometry.type === 'Polygon')
              .map(room => room.geometry)
          );
          
          if (!pathClear) {
            return;
          }
        }
        
        const tentativeGScore = gScore[currentId] + connection.distance;
        
        if (!openSet.has(neighborId)) {
          openSet.add(neighborId);
        } else if (tentativeGScore >= gScore[neighborId]) {
          return;
        }
        
        // This path to neighbor is the best so far
        cameFrom[neighborId] = currentId;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = gScore[neighborId] + 
          calculateDistance(neighbor.coordinates, endIntersection.coordinates);
          
      });
      
      if (isCrossWing && iterations % 100 === 0) {
      }
    }
    
    if (isCrossWing) {
    } else {
      
      // Check if end intersection was ever reached
      if (gScore[endIntersection.id] === Infinity) {
        
        // Check if start intersection has any valid connections
        const validConnections = startIntersection.connections.filter(conn => {
          const target = intersections.find(i => i.id === conn.targetId);
          return target && target.coordinates && target.coordinates.length === 2;
        });
        
        // Network fragmentation detected - return null to trigger emergency connection creation
      } else {
      }
    }
    
    // Return null when pathfinding fails instead of a direct line
    return null;
  };

  // NEW: Updated navigation route calculation using intersection graph
  const calculateIntersectionNavigationRoute = () => {
    
    if (!startRoom || !endRoom) {
      setDebugInfo('Please select both start and end rooms');
      return;
    }

    setDebugInfo('Calculating route using intersection network...');
    
    try {
      const startCoords = startRoom.coordinates;
      const endCoords = endRoom.coordinates;
      
      
      // Enhanced debugging for room data
      
      // Check if we can determine wings from room data
      const startWing = startRoom.data?.wing || startRoom.wing || 'Unknown';
      const endWing = endRoom.data?.wing || endRoom.wing || 'Unknown';
      
      const isCrossWingNavigation = startWing !== endWing && startWing !== 'Unknown' && endWing !== 'Unknown';
      
      // Check for cross-floor navigation
      
      // Enhanced floor detection with fallback logic
      let startFloor = startRoom.floor || startRoom.data?.floor;
      let endFloor = endRoom.floor || endRoom.data?.floor;
      
      
      // If still no floor, try to detect from room name/displayName
      if (!startFloor) {
        const roomName = startRoom.name || startRoom.displayName || '';
        const floorMatch = roomName.match(/^(\d+)[ABC]/);
        if (floorMatch) {
          startFloor = parseInt(floorMatch[1]);
        }
      }
      if (!endFloor) {
        const roomName = endRoom.name || endRoom.displayName || '';
        const floorMatch = roomName.match(/^(\d+)[ABC]/);
        if (floorMatch) {
          endFloor = parseInt(floorMatch[1]);
        }
      }
      
      // Default to current floor if still not detected
      startFloor = startFloor || currentFloor;
      endFloor = endFloor || currentFloor;
      
      // TEMPORARY TEST: Force cross-floor detection for testing
      // Remove this after debugging
      if (startRoom.displayName && endRoom.displayName) {
        const startHasFloor = /^[123][ABC]/.test(startRoom.displayName);
        const endHasFloor = /^[123][ABC]/.test(endRoom.displayName);
        if (startHasFloor && endHasFloor) {
          const startFloorFromName = parseInt(startRoom.displayName.charAt(0));
          const endFloorFromName = parseInt(endRoom.displayName.charAt(0));
          if (!isNaN(startFloorFromName) && !isNaN(endFloorFromName)) {
            startFloor = startFloorFromName;
            endFloor = endFloorFromName;
          }
        }
      }
      
      const isCrossFloorNavigation = startFloor !== endFloor;
      
      // If cross-floor navigation is needed, show transport selection
      if (isCrossFloorNavigation) {
        setDebugInfo(`Cross-floor navigation: Floor ${startFloor} → Floor ${endFloor}. Select transport method.`);
        findAvailableTransports(startFloor, endFloor);
        return;
      }
      
      if (intersectionData.length === 0) {
        const simpleRoute = [startCoords, endCoords];
        displayRoute(simpleRoute);
        return;
      }

      // Find closest intersections to start and end points
      const startIntersection = findClosestIntersection(startCoords, intersectionData);
      const endIntersection = findClosestIntersection(endCoords, intersectionData);
      
      if (!startIntersection || !endIntersection) {
        const simpleRoute = [startCoords, endCoords];
        displayRoute(simpleRoute);
        return;
      }
      
      
      // Create a proper copy of intersection data for processing
      let updatedIntersectionData = [...intersectionData];
      
      // Log intersection connectivity for debugging
      
      // Debug connection types for start intersection
      const startConnectionTypes = {};
      startIntersection.connections.forEach(conn => {
        const targetIntersection = updatedIntersectionData.find(i => i.id === conn.targetId);
        if (targetIntersection) {
          startConnectionTypes[targetIntersection.type] = (startConnectionTypes[targetIntersection.type] || 0) + 1;
        }
      });
      
      // Debug connection types for end intersection  
      const endConnectionTypes = {};
      endIntersection.connections.forEach(conn => {
        const targetIntersection = updatedIntersectionData.find(i => i.id === conn.targetId);
        if (targetIntersection) {
          endConnectionTypes[targetIntersection.type] = (endConnectionTypes[targetIntersection.type] || 0) + 1;
        }
      });
      
      if (isCrossWingNavigation) {
        // Check if we have cross-wing connections in the network
        let crossWingConnectionsFound = 0;
        intersectionData.forEach(intersection => {
          intersection.connections.forEach(conn => {
            const targetIntersection = intersectionData.find(i => i.id === conn.targetId);
            if (targetIntersection && intersection.wing !== targetIntersection.wing) {
              crossWingConnectionsFound++;
            }
          });
        });
        
        if (crossWingConnectionsFound === 0) {
          setDebugInfo('❌ No cross-wing connections - click "Fix Cross-Wing" button');
          
          // Auto-suggest using the fix
        } else {
        }
      }
      
      // Enhanced debugging for cross-wing pathfinding
      if (isCrossWingNavigation) {
        
        // Check if there's any cross-wing connection path available
        let canReachOtherWing = false;
        const visitedIds = new Set();
        const toCheck = [startIntersection.id];
        
        while (toCheck.length > 0 && !canReachOtherWing) {
          const currentId = toCheck.shift();
          if (visitedIds.has(currentId)) continue;
          visitedIds.add(currentId);
          
          const currentIntersection = intersectionData.find(i => i.id === currentId);
          if (!currentIntersection) continue;
          
          if (currentIntersection.wing !== startIntersection.wing) {
            canReachOtherWing = true;
            break;
          }
          
          // Add connected intersections to check
          currentIntersection.connections.forEach(conn => {
            if (!visitedIds.has(conn.targetId)) {
              toCheck.push(conn.targetId);
            }
          });
          
          // Limit search to avoid infinite loops
          if (visitedIds.size > 50) break;
        }
        
        if (!canReachOtherWing) {
        }
      }
      
      // Check for isolated intersections before pathfinding  
      let connectionsCreated = false;
      
      // Find the actual intersection objects in the updated data array
      const actualStartIntersection = updatedIntersectionData.find(i => i.id === startIntersection.id);
      const actualEndIntersection = updatedIntersectionData.find(i => i.id === endIntersection.id);
      
      if (actualStartIntersection && actualStartIntersection.connections.length === 0) {
        connectIsolatedIntersection(actualStartIntersection, updatedIntersectionData);
        connectionsCreated = true;
      }
      
      if (actualEndIntersection && actualEndIntersection.connections.length === 0) {
        connectIsolatedIntersection(actualEndIntersection, updatedIntersectionData);
        connectionsCreated = true;
      }
      
      // If we created emergency connections, update the state
      if (connectionsCreated) {
        setIntersectionData([...updatedIntersectionData]);
      }
      
      // Debug: Verify emergency connections before A*
      if (connectionsCreated) {
        
        if (actualEndIntersection && actualEndIntersection.connections.length > 0) {
        }
      }
      
      // Find path through intersection network using Dijkstra's algorithm  
      // Use the updated intersection references for pathfinding
      let pathfindingStartIntersection = actualStartIntersection || startIntersection;
      let pathfindingEndIntersection = actualEndIntersection || endIntersection;
      
      if (connectionsCreated) {
        
        // Debug: Print all emergency connections that were created
        updatedIntersectionData.forEach(intersection => {
          const emergencyConnections = intersection.connections.filter(conn => 
            conn.pathType && conn.pathType.includes('emergency')
          );
          if (emergencyConnections.length > 0) {
          }
        });
      }
      
      const intersectionPath = findShortestIntersectionPath(pathfindingStartIntersection, pathfindingEndIntersection, updatedIntersectionData);
      
      if (!intersectionPath || intersectionPath.length === 0) {
        if (isCrossWingNavigation) {
        }
        
        // Additional debugging when pathfinding fails after emergency connections
        if (connectionsCreated) {
        }
        
        // Try to fix network fragmentation by creating bridge connections
        if (!connectionsCreated) {
          const fragmentationFixed = fixNetworkFragmentation(pathfindingStartIntersection, pathfindingEndIntersection, updatedIntersectionData);
          
          if (fragmentationFixed) {
            setIntersectionData([...updatedIntersectionData]);
            
            // Retry pathfinding with the bridge connections
            const retryPath = findShortestIntersectionPath(pathfindingStartIntersection, pathfindingEndIntersection, updatedIntersectionData);
            if (retryPath && retryPath.length > 0) {
              const fullRoute = [startCoords, ...retryPath.map(p => p.coordinates), endCoords];
              displayRoute(fullRoute);
              return;
            }
          }
        }
        
        const simpleRoute = [startCoords, endCoords];
        displayRoute(simpleRoute);
        return;
      }
      
      if (isCrossWingNavigation) {
      } else {
      }
      
      // Build final route coordinates with corridor following
      let routeCoordinates = [startCoords];
      
      // Add intersection waypoints
      for (let i = 0; i < intersectionPath.length; i++) {
        const intersection = intersectionPath[i];
        routeCoordinates.push(intersection.coordinates);
        
        // If this isn't the last intersection, add corridor waypoints to next intersection
        if (i < intersectionPath.length - 1) {
          const nextIntersection = intersectionPath[i + 1];
          const corridorWaypoints = generateCorridorWaypoints(
            intersection.coordinates,
            nextIntersection.coordinates,
            Object.values(roomData).filter(room => room.geometry && room.geometry.type === 'Polygon').map(room => room.geometry)
          );
          routeCoordinates.push(...corridorWaypoints);
        }
      }
      
      routeCoordinates.push(endCoords);
      
      // Remove duplicate consecutive coordinates and smooth the path
      const cleanedRoute = smoothNavigationPath(routeCoordinates);
      
      displayRoute(cleanedRoute);

    } catch (error) {
      setDebugInfo(`Route calculation failed: ${error.message}`);
      
      // Fallback to simple route
      try {
        const fallbackRoute = [startRoom.coordinates, endRoom.coordinates];
        displayRoute(fallbackRoute);
      } catch (fallbackError) {
      }
    }
  };

  // Display route on map
  const displayRoute = (routeCoordinates) => {
    
    if (!routeCoordinates || routeCoordinates.length < 2) {
      setDebugInfo('Invalid route data');
      return;
    }

    try {
      // Remove existing route layers
      const routeLayerId = 'navigation-route';
      const routeSourceId = 'navigation-route';
      
      if (mapRef.current.getLayer(routeLayerId)) {
        mapRef.current.removeLayer(routeLayerId);
      }
      if (mapRef.current.getSource(routeSourceId)) {
        mapRef.current.removeSource(routeSourceId);
      }

      // Validate coordinates format
      const validCoordinates = routeCoordinates.filter(coord => {
        if (!coord || !Array.isArray(coord) || coord.length !== 2) {
          return false;
        }
        if (isNaN(coord[0]) || isNaN(coord[1])) {
          return false;
        }
        return true;
      });

      if (validCoordinates.length < 2) {
        setDebugInfo('Invalid coordinate data');
        return;
      }


      // Create GeoJSON for the route
      const routeGeoJSON = {
        type: 'Feature',
        properties: {
          name: 'Navigation Route'
        },
        geometry: {
          type: 'LineString',
          coordinates: validCoordinates
        }
      };


      // Add route source
      mapRef.current.addSource(routeSourceId, {
        type: 'geojson',
        data: routeGeoJSON
      });


      // Add route layer with prominent styling
      mapRef.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF0000', // Bright red for visibility
          'line-width': 5,        
          'line-opacity': 1.0      
        }
      });


      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < validCoordinates.length - 1; i++) {
        const segmentDistance = calculateDistance(validCoordinates[i], validCoordinates[i + 1]);
        totalDistance += segmentDistance;
      }

      setCurrentRoute({ 
        coordinates: validCoordinates, 
        distance: totalDistance
      });
      

      // Fit map to show the route with padding
      const bounds = new mapboxgl.LngLatBounds();
      validCoordinates.forEach(coord => {
        bounds.extend(coord);
      });
      
      mapRef.current.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      });

      // Add animated route drawing effect
      setTimeout(() => {
        animateRouteDrawing(routeSourceId, validCoordinates);
      }, 1000); // Wait for map to finish fitting

      // Add animated marker after route drawing
      setTimeout(() => {
        animateMarkerAlongRoute(validCoordinates);
      }, 2000); // Start marker animation after route drawing


    } catch (error) {
      setDebugInfo(`Route display failed: ${error.message}`);
    }
  };

  // Animate route drawing effect
  const animateRouteDrawing = (sourceId, coordinates) => {
    if (!mapRef.current || !coordinates || coordinates.length < 2) return;

    let currentPointIndex = 0;
    const animationSpeed = 100; // milliseconds between points

    const drawNextSegment = () => {
      if (currentPointIndex >= coordinates.length - 1) return;

      currentPointIndex++;
      const partialCoordinates = coordinates.slice(0, currentPointIndex + 1);

      const routeGeoJSON = {
        type: 'Feature',
        properties: { name: 'Navigation Route' },
        geometry: {
          type: 'LineString',
          coordinates: partialCoordinates
        }
      };

      try {
        if (mapRef.current.getSource(sourceId)) {
          mapRef.current.getSource(sourceId).setData(routeGeoJSON);
        }
      } catch (error) {
        console.warn('Route animation error:', error);
        return;
      }

      if (currentPointIndex < coordinates.length - 1) {
        setTimeout(drawNextSegment, animationSpeed);
      }
    };

    // Start with just the first point
    const initialGeoJSON = {
      type: 'Feature',
      properties: { name: 'Navigation Route' },
      geometry: {
        type: 'LineString',
        coordinates: [coordinates[0], coordinates[0]]
      }
    };

    try {
      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.getSource(sourceId).setData(initialGeoJSON);
        setTimeout(drawNextSegment, animationSpeed);
      }
    } catch (error) {
      console.warn('Route animation initialization error:', error);
    }
  };

  // Enhanced marker animation along route
  const animateMarkerAlongRoute = (routeCoordinates) => {
    if (!routeCoordinates || routeCoordinates.length < 2 || !mapRef.current) return;

    // Remove any existing animated marker
    const existingMarkers = document.querySelectorAll('.animated-navigation-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Create enhanced marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'animated-navigation-marker';
    markerElement.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background: #4CAF50;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
        animation: pulse 2s infinite;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid #4CAF50;
        "></div>
      </div>
    `;

    // Add CSS animation for pulsing effect if not already added
    if (!document.querySelector('#route-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'route-animation-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4); }
          50% { transform: scale(1.2); box-shadow: 0 2px 12px rgba(76, 175, 80, 0.6); }
          100% { transform: scale(1); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4); }
        }
      `;
      document.head.appendChild(style);
    }

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(routeCoordinates[0])
      .addTo(mapRef.current);

    let startTime = null;
    const duration = Math.max(8000, routeCoordinates.length * 300); // Dynamic duration based on route length

    const frame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const ratio = Math.min(progress / duration, 1);

      if (ratio < 1) {
        const totalSegments = routeCoordinates.length - 1;
        const currentSegment = Math.floor(ratio * totalSegments);
        const segmentProgress = (ratio * totalSegments) - currentSegment;

        if (currentSegment < totalSegments) {
          const point1 = routeCoordinates[currentSegment];
          const point2 = routeCoordinates[currentSegment + 1];

          const lng = point1[0] + (point2[0] - point1[0]) * segmentProgress;
          const lat = point1[1] + (point2[1] - point1[1]) * segmentProgress;

          marker.setLngLat([lng, lat]);
        }
        
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        // Animation completed - keep marker at destination for a moment then remove
        setTimeout(() => {
          marker.remove();
        }, 2000);
      }
    };

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(frame);
  };

  // NEW: Fix network fragmentation by creating bridge connections
  const fixNetworkFragmentation = (startIntersection, endIntersection, intersections) => {
    
    // Find all intersections reachable from start (using BFS)
    const startComponent = findConnectedComponent(startIntersection, intersections);
    const endComponent = findConnectedComponent(endIntersection, intersections);
    
    
    if (startComponent.has(endIntersection.id)) {
      return false;
    }
    
    // Find the closest pair of intersections between the two components
    let minDistance = Infinity;
    let bestStartNode = null;
    let bestEndNode = null;
    
    for (const startId of startComponent) {
      const startNode = intersections.find(i => i.id === startId);
      if (!startNode) continue;
      
      for (const endId of endComponent) {
        const endNode = intersections.find(i => i.id === endId);
        if (!endNode) continue;
        
        const distance = calculateDistance(startNode.coordinates, endNode.coordinates);
        if (distance < minDistance) {
          minDistance = distance;
          bestStartNode = startNode;
          bestEndNode = endNode;
        }
      }
    }
    
    if (bestStartNode && bestEndNode && minDistance <= 150) { // Max bridge distance
      // Create bidirectional bridge connection
      const weight = minDistance * 1.5; // Higher weight for bridge connections
      
      const startIndex = intersections.indexOf(bestStartNode);
      const endIndex = intersections.indexOf(bestEndNode);
      
      bestStartNode.connections.push({
        targetId: bestEndNode.id,
        targetIndex: endIndex,
        distance: minDistance,
        weight: weight,
        pathType: 'fragmentation-bridge'
      });
      
      bestEndNode.connections.push({
        targetId: bestStartNode.id,
        targetIndex: startIndex,
        distance: minDistance,
        weight: weight,
        pathType: 'fragmentation-bridge'
      });
      
      return true;
    } else {
      return false;
    }
  };
  
  // NEW: Find all intersections in the same connected component using BFS
  const findConnectedComponent = (startIntersection, intersections) => {
    const visited = new Set();
    const queue = [startIntersection.id];
    visited.add(startIntersection.id);
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      const currentNode = intersections.find(i => i.id === currentId);
      if (!currentNode) continue;
      
      // Add all connected neighbors to the queue
      currentNode.connections.forEach(conn => {
        if (!visited.has(conn.targetId)) {
          visited.add(conn.targetId);
          queue.push(conn.targetId);
        }
      });
    }
    
    return visited;
  };

  // NEW: Connect isolated intersections to nearest corridor points
  const connectIsolatedIntersection = (isolatedIntersection, intersections) => {
    
    // Find nearest corridor intersections (not room entrances)
    const corridorTypes = ['corridor_junction', 'corridor_turn', 'staircase_entrance', 'elevator_entrance'];
    const corridorIntersections = intersections.filter(i => 
      corridorTypes.includes(i.type) && 
      i.wing === isolatedIntersection.wing && // Same wing
      i.id !== isolatedIntersection.id
    );
    
    if (corridorIntersections.length === 0) {
      return;
    }
    
    // Find closest corridor intersection
    let closestCorridor = null;
    let minDistance = Infinity;
    
    corridorIntersections.forEach(corridor => {
      const distance = calculateDistance(isolatedIntersection.coordinates, corridor.coordinates);
      if (distance < minDistance) {
        minDistance = distance;
        closestCorridor = corridor;
      }
    });
    
    if (closestCorridor && minDistance <= 200) { // Max 200m connection
      // Create bidirectional connection
      const weight = minDistance * 1.2; // Slight penalty for emergency connections
      
      const isolatedIndex = intersections.indexOf(isolatedIntersection);
      const corridorIndex = intersections.indexOf(closestCorridor);
      
      isolatedIntersection.connections.push({
        targetId: closestCorridor.id,
        targetIndex: corridorIndex,
        distance: minDistance,
        weight: weight,
        pathType: 'emergency-corridor-connection'
      });
      
      closestCorridor.connections.push({
        targetId: isolatedIntersection.id,
        targetIndex: isolatedIndex,
        distance: minDistance,
        weight: weight,
        pathType: 'emergency-corridor-connection'
      });
      
    } else {
    }
  };

  // NEW: Find available transports for cross-floor navigation
  const findAvailableTransports = (startFloor, endFloor) => {
    
    // Find all stairs and elevators that connect these floors
    const availableOptions = [];
    
    // Group intersections by location_id for stairs and elevators
    const transportGroups = {};
    const transportPoints = intersectionData.filter(point => 
      point.location_id && (point.type === 'staircase_entrance' || point.type === 'elevator_entrance')
    );
    
    
    transportPoints.forEach(point => {
      if (!transportGroups[point.location_id]) {
        transportGroups[point.location_id] = [];
      }
      transportGroups[point.location_id].push(point);
    });
    
    // Separate stairs and elevators, and find the most efficient option for each type
    const stairOptions = [];
    const elevatorOptions = [];
    
    Object.entries(transportGroups).forEach(([locationId, points]) => {
      const floors = points.map(p => p.floor);
      if (floors.includes(startFloor) && floors.includes(endFloor)) {
        const startPoint = points.find(p => p.floor === startFloor);
        const endPoint = points.find(p => p.floor === endFloor);
        
        if (startPoint && endPoint) {
          // For floor 3, filter by destination wing since A and B wings are not connected
          let isValidForDestination = true;
          if (endFloor === 3) {
            const destinationWing = endRoom?.data?.room_name ? endRoom.data.room_name.charAt(1) : // Extract wing from room name like "3A101"
                                  endRoom?.displayName ? endRoom.displayName.charAt(1) : null;
            
            const transportWing = endPoint.wing || endPoint.id?.charAt(1); // Get transport's wing
            
            
            if (destinationWing && transportWing && destinationWing.toUpperCase() !== transportWing.toUpperCase()) {
              isValidForDestination = false;
            }
          }
          
          if (isValidForDestination) {
            const option = {
              locationId,
              type: startPoint.type === 'staircase_entrance' ? 'stairs' : 'elevator',
              startPoint,
              endPoint,
              description: startPoint.description || `${startPoint.type === 'staircase_entrance' ? 'Stairs' : 'Elevator'} at ${locationId}`,
              // Calculate distance from current start room to this transport
              distanceFromStart: startRoom ? calculateDistance(
                [parseFloat(startRoom.key.split(',')[0]), parseFloat(startRoom.key.split(',')[1])],
                startPoint.coordinates
              ) : Infinity,
              wing: endPoint.wing || endPoint.id?.charAt(1) // Store wing info
            };
            
            if (option.type === 'stairs') {
              stairOptions.push(option);
            } else {
              elevatorOptions.push(option);
            }
          }
        }
      }
    });
    
    // Sort by distance to find the most efficient options
    stairOptions.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    elevatorOptions.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    
    // Create simplified transport choices
    const simplifiedOptions = [];
    
    if (stairOptions.length > 0) {
      const wingInfo = endFloor === 3 && stairOptions[0].wing ? ` in ${stairOptions[0].wing.toUpperCase()}-wing` : '';
      simplifiedOptions.push({
        type: 'stairs',
        label: 'Take Stairs',
        bestOption: stairOptions[0], // Use the closest stairs
        icon: 'stairs',
        description: `Use the nearest staircase${wingInfo} (${stairOptions[0].description})`
      });
    }
    
    if (elevatorOptions.length > 0) {
      const wingInfo = endFloor === 3 && elevatorOptions[0].wing ? ` in ${elevatorOptions[0].wing.toUpperCase()}-wing` : '';
      simplifiedOptions.push({
        type: 'elevator',
        label: 'Take Elevator',
        bestOption: elevatorOptions[0], // Use the closest elevator
        icon: 'elevator',
        description: `Use the nearest elevator${wingInfo} (${elevatorOptions[0].description})`
      });
    }
    
    
    if (simplifiedOptions.length === 0) {
      setDebugInfo(`No direct transport found between floors ${startFloor} and ${endFloor}`);
      return;
    }
    
    // Store navigation details for later use
    setPendingNavigation({
      startRoom,
      endRoom,
      startFloor,
      endFloor
    });
    
    setAvailableTransports(simplifiedOptions);
    setShowTransportModal(true);
  };
  
  // NEW: Handle transport selection and calculate route
  const selectTransport = (selectedTransport) => {
    setShowTransportModal(false);
    
    if (!pendingNavigation) {
      return;
    }
    
    // Use the best (closest) option for the selected transport type
    const transport = selectedTransport.bestOption;
    
    // Calculate route using the selected transport
    calculateCrossFloorRoute(pendingNavigation, transport);
    setPendingNavigation(null);
  };
  
  // NEW: Calculate cross-floor route using selected transport
  const calculateCrossFloorRoute = (navigation, transport) => {
    
    try {
      const { startRoom, endRoom, startFloor, endFloor } = navigation;
      const { startPoint, endPoint } = transport;
      
      // First, show route to transport on current floor
      const startFloorIntersections = intersectionData.filter(p => p.floor === startFloor);
      const segmentToTransport = calculateRouteSegment(startRoom.coordinates, startPoint.coordinates, startFloorIntersections);
      
      
      // Display the route to transport entrance
      displayRoute(segmentToTransport);
      
      // Show message to user about floor switching
      const transportName = transport.type === 'stairs' ? 'stairs' : 'elevator';
      setDebugInfo(`Follow the path to the ${transportName}, then switch to floor ${endFloor} to see the rest of the route.`);
      
      // Store the continuation route for when user switches floors
      const endFloorIntersections = intersectionData.filter(p => p.floor === endFloor);
      
      
      if (endFloorIntersections.length > 0) {
      }
      
      const segmentFromTransport = calculateRouteSegment(endPoint.coordinates, endRoom.coordinates, endFloorIntersections);
      
      // Store the complete route data for potential floor switching
      window.pendingCrossFloorRoute = {
        transportPoint: endPoint.coordinates,
        destinationRoute: segmentFromTransport,
        targetFloor: endFloor,
        transportType: transport.type
      };
      
      
      
    } catch (error) {
      setDebugInfo('Error calculating cross-floor route');
    }
  };
  
  // NEW: Calculate route segment between two points using intersections or hallways
  const calculateRouteSegment = (startCoords, endCoords, floorIntersections) => {
    
    // Determine floor from intersection data
    const floor = floorIntersections.length > 0 ? floorIntersections[0].floor : 2;
    
    // Use intersection-based routing for all floors
    return calculateIntersectionBasedRoute(startCoords, endCoords, floorIntersections);
  };
  
  // NEW: Hallway-based routing for floors 1 and 3
  const calculateHallwayBasedRoute = (startCoords, endCoords, floor) => {
    
    // Get hallway data for this floor
    const floorHallways = {};
    Object.entries(hallwayData).forEach(([hallwayKey, segments]) => {
      const hallwayFloor = hallwayKey.split('-')[0];
      if (parseInt(hallwayFloor) === floor) {
        floorHallways[hallwayKey] = segments;
      }
    });
    
    
    if (Object.keys(floorHallways).length === 0) {
      return [startCoords, endCoords];
    }
    
    // Build hallway network graph
    const hallwayGraph = buildHallwayGraph(floorHallways, floor);
    
    // Find route through hallway network
    const hallwayRoute = findHallwayRoute(startCoords, endCoords, hallwayGraph, floor);
    
    return hallwayRoute;
  };
  
  // NEW: Traditional intersection-based routing for floor 2
  const calculateIntersectionBasedRoute = (startCoords, endCoords, floorIntersections) => {
    
    if (floorIntersections.length > 0) {
    }
    
    if (floorIntersections.length === 0) {
      return [startCoords, endCoords];
    }
    
    const startIntersection = findClosestIntersection(startCoords, floorIntersections);
    const endIntersection = findClosestIntersection(endCoords, floorIntersections);
    
    
    if (!startIntersection || !endIntersection) {
      return [startCoords, endCoords];
    }
    
    // Use existing pathfinding logic
    const intersectionPath = findShortestIntersectionPath(startIntersection, endIntersection, floorIntersections);
    
    
    if (!intersectionPath || intersectionPath.length === 0) {
      return [startCoords, endCoords];
    }
    
    // Build route coordinates
    let segmentCoordinates = [startCoords];
    intersectionPath.forEach(intersection => {
      segmentCoordinates.push(intersection.coordinates);
    });
    segmentCoordinates.push(endCoords);
    
    return segmentCoordinates;
  };
  
  // NEW: Build hallway graph from hallway segments
  const buildHallwayGraph = (floorHallways, floor) => {
    
    const hallwayNodes = [];
    const hallwayEdges = [];
    
    // Extract all coordinate points from hallway segments
    Object.entries(floorHallways).forEach(([hallwayKey, segments]) => {
      segments.forEach((segment, segmentIndex) => {
        if (!segment.geometry || !segment.geometry.coordinates) {
          return;
        }
        
        const coordinates = segment.geometry.coordinates;
        
        // Add each coordinate as a potential node
        coordinates.forEach((coord, coordIndex) => {
          const nodeId = `${hallwayKey}_${segmentIndex}_${coordIndex}`;
          hallwayNodes.push({
            id: nodeId,
            coordinates: coord,
            hallwayKey: hallwayKey,
            segmentIndex: segmentIndex,
            coordIndex: coordIndex
          });
          
          // Create bidirectional edge to next coordinate in same segment
          if (coordIndex < coordinates.length - 1) {
            const nextNodeId = `${hallwayKey}_${segmentIndex}_${coordIndex + 1}`;
            const distance = calculateDistance(coord, coordinates[coordIndex + 1]);
            
            // Add both directions for hallway navigation
            hallwayEdges.push({
              from: nodeId,
              to: nextNodeId,
              distance: distance,
              type: 'hallway_segment'
            });
            
            hallwayEdges.push({
              from: nextNodeId,
              to: nodeId,
              distance: distance,
              type: 'hallway_segment'
            });
          }
        });
      });
    });
    
    // Connect nodes that are very close to each other (intersection points)
    const connectionThreshold = 5.0; // Increased to 5 meters for better connectivity
    let junctionConnections = 0;
    
    
    for (let i = 0; i < hallwayNodes.length; i++) {
      for (let j = i + 1; j < hallwayNodes.length; j++) {
        const node1 = hallwayNodes[i];
        const node2 = hallwayNodes[j];
        
        // Skip if same hallway segment
        if (node1.hallwayKey === node2.hallwayKey && node1.segmentIndex === node2.segmentIndex) {
          continue;
        }
        
        const distance = calculateDistance(node1.coordinates, node2.coordinates);
        if (distance <= connectionThreshold) {
          hallwayEdges.push({
            from: node1.id,
            to: node2.id,
            distance: distance,
            type: 'hallway_junction'
          });
          
          hallwayEdges.push({
            from: node2.id,
            to: node1.id,
            distance: distance,
            type: 'hallway_junction'
          });
          
          junctionConnections += 2;
          
          if (junctionConnections <= 10) { // Log first few connections
          }
        }
      }
    }
    
    
    
    return { nodes: hallwayNodes, edges: hallwayEdges };
  };
  
  // NEW: Find route through hallway network
  const findHallwayRoute = (startCoords, endCoords, hallwayGraph, floor) => {
    
    const { nodes, edges } = hallwayGraph;
    
    if (nodes.length === 0) {
      return [startCoords, endCoords];
    }
    
    // Find closest hallway nodes to start and end points
    let closestStartNode = null;
    let closestEndNode = null;
    let minStartDistance = Infinity;
    let minEndDistance = Infinity;
    
    nodes.forEach(node => {
      const startDistance = calculateDistance(startCoords, node.coordinates);
      const endDistance = calculateDistance(endCoords, node.coordinates);
      
      if (startDistance < minStartDistance) {
        minStartDistance = startDistance;
        closestStartNode = node;
      }
      
      if (endDistance < minEndDistance) {
        minEndDistance = endDistance;
        closestEndNode = node;
      }
    });
    
    
    if (!closestStartNode || !closestEndNode) {
      return [startCoords, endCoords];
    }
    
    if (closestStartNode.id === closestEndNode.id) {
      return [startCoords, closestStartNode.coordinates, endCoords];
    }
    
    // Use Dijkstra's algorithm to find shortest path through hallway network
    const hallwayPath = findShortestHallwayPath(closestStartNode, closestEndNode, nodes, edges);
    
    if (!hallwayPath || hallwayPath.length === 0) {
      return [startCoords, endCoords];
    }
    
    // Build final route coordinates
    let routeCoordinates = [startCoords];
    hallwayPath.forEach(node => {
      routeCoordinates.push(node.coordinates);
    });
    routeCoordinates.push(endCoords);
    
    return routeCoordinates;
  };
  
  // NEW: Dijkstra's algorithm for hallway pathfinding
  const findShortestHallwayPath = (startNode, endNode, nodes, edges) => {
    
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    // Initialize distances
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    
    // Build adjacency list for faster lookup
    const adjacency = {};
    edges.forEach(edge => {
      if (!adjacency[edge.from]) {
        adjacency[edge.from] = [];
      }
      adjacency[edge.from].push({
        to: edge.to,
        distance: edge.distance
      });
    });
    
    // Debug adjacency for start and end nodes
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNodeId = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNodeId = nodeId;
        }
      }
      
      if (currentNodeId === null || minDistance === Infinity) {
        break; // No more reachable nodes
      }
      
      // Early exit if we reached the target
      if (currentNodeId === endNode.id) {
        break;
      }
      
      unvisited.delete(currentNodeId);
      
      // Check neighbors
      const neighbors = adjacency[currentNodeId] || [];
      neighbors.forEach(neighbor => {
        if (unvisited.has(neighbor.to)) {
          const newDistance = distances[currentNodeId] + neighbor.distance;
          if (newDistance < distances[neighbor.to]) {
            distances[neighbor.to] = newDistance;
            previous[neighbor.to] = currentNodeId;
          }
        }
      });
    }
    
    // Reconstruct path
    const path = [];
    let currentId = endNode.id;
    
    while (currentId !== null) {
      const node = nodes.find(n => n.id === currentId);
      if (node) {
        path.unshift(node);
      }
      currentId = previous[currentId];
    }
    
    if (path.length === 0 || path[0].id !== startNode.id) {
      
      // Check if end node was ever reached
      if (distances[endNode.id] === Infinity) {
      }
      
      return null;
    }
    
    return path;
  };

  // Clear navigation
  const clearNavigation = () => {
    
    try {
      // Clear route layers
      const routeLayerIds = ['navigation-route', 'navigation-route-background'];
      const routeSourceIds = ['navigation-route'];
      
      routeLayerIds.forEach(layerId => {
        if (mapRef.current.getLayer(layerId)) {
          mapRef.current.removeLayer(layerId);
        }
      });
      
      routeSourceIds.forEach(sourceId => {
        if (mapRef.current.getSource(sourceId)) {
          mapRef.current.removeSource(sourceId);
        }
      });

      // Clear room highlights
      ['start', 'end'].forEach(type => {
        const layerId = `highlighted-room-${type}-layer`;
        const sourceId = `highlighted-room-${type}`;
        
        if (mapRef.current.getLayer(layerId)) {
          mapRef.current.removeLayer(layerId);
        }
        if (mapRef.current.getSource(sourceId)) {
          mapRef.current.removeSource(sourceId);
        }
      });

      // Reset state
      setStartRoom(null);
      setEndRoom(null);
      setStartRoomInput('');
      setEndRoomInput('');
      setCurrentRoute(null);
      setRouteSearchResults({ start: [], end: [] });
      setShowTransportModal(false);
      setPendingNavigation(null);
      setAvailableTransports([]);
      setDebugInfo('Navigation cleared');
      
      
    } catch (error) {
      setDebugInfo(`Clear failed: ${error.message}`);
    }
  };

  // NEW: Visualization function for intersection network
  const visualizeIntersectionNetwork = () => {
    
    if (!intersectionData || intersectionData.length === 0) {
      setDebugInfo('No intersection data to visualize');
      return;
    }
    
    // Remove existing visualization
    const pointLayerId = 'intersection-points-viz';
    const connectionLayerId = 'intersection-connections-viz';
    const pointSourceId = 'intersection-points-viz';
    const connectionSourceId = 'intersection-connections-viz';
    
    [pointLayerId, connectionLayerId].forEach(layerId => {
      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.removeLayer(layerId);
      }
    });
    
    [pointSourceId, connectionSourceId].forEach(sourceId => {
      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeSource(sourceId);
      }
    });
    
    // Create GeoJSON for intersection points
    const pointFeatures = intersectionData.map(point => ({
      type: 'Feature',
      properties: {
        id: point.id,
        type: point.type,
        connections: point.connections.length,
        description: point.description
      },
      geometry: {
        type: 'Point',
        coordinates: point.coordinates
      }
    }));
    
    // Create GeoJSON for connections
    const connectionFeatures = [];
    intersectionData.forEach(point => {
      point.connections.forEach(connection => {
        const targetPoint = intersectionData.find(p => p.id === connection.targetId);
        if (targetPoint) {
          connectionFeatures.push({
            type: 'Feature',
            properties: {
              from: point.id,
              to: targetPoint.id,
              distance: connection.distance
            },
            geometry: {
              type: 'LineString',
              coordinates: [point.coordinates, targetPoint.coordinates]
            }
          });
        }
      });
    });
    
    // Add point visualization
    mapRef.current.addSource(pointSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: pointFeatures
      }
    });
    
    mapRef.current.addLayer({
      id: pointLayerId,
      type: 'circle',
      source: pointSourceId,
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'type'], 'corridor_junction'], 8,
          ['==', ['get', 'type'], 'staircase_entrance'], 7,
          ['==', ['get', 'type'], 'elevator_entrance'], 7,
          ['==', ['get', 'type'], 'corridor_turn'], 5,
          4 // room_entrance
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'type'], 'corridor_junction'], '#FF0000',    // Red for junctions
          ['==', ['get', 'type'], 'staircase_entrance'], '#0000FF',   // Blue for stairs
          ['==', ['get', 'type'], 'elevator_entrance'], '#8A2BE2',    // Purple for elevators
          ['==', ['get', 'type'], 'corridor_turn'], '#FFA500',       // Orange for turns
          '#00FF00' // Green for room entrances
        ],
        'circle-opacity': 0.8,
        'circle-stroke-color': '#000000',
        'circle-stroke-width': 2
      }
    });
    
    // Add connection visualization
    mapRef.current.addSource(connectionSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: connectionFeatures
      }
    });
    
    mapRef.current.addLayer({
      id: connectionLayerId,
      type: 'line',
      source: connectionSourceId,
      paint: {
        'line-color': '#CCCCCC',
        'line-width': 1,
        'line-opacity': 0.6
      }
    });
    
    setDebugInfo(`Showing ${intersectionData.length} intersections with ${connectionFeatures.length / 2} connections`);
  };

  // NEW: Clean cross-wing connectivity checker
  const checkCrossWingConnectivity = () => {
    console.clear(); // Clear console for easier reading
    
    if (intersectionData.length === 0) {
      setDebugInfo('❌ No intersection data');
      return;
    }
    
    // First, let's examine the data structure differences
    
    // Sample a few intersections to check their properties
    const sampleIntersections = intersectionData.slice(0, 10);
    sampleIntersections.forEach((intersection, index) => {
    });
    
    // Look for intersections that might be B-wing but not labeled correctly
    const possibleBWing = intersectionData.filter(i => 
      i.id && (i.id.toLowerCase().includes('b') || 
               (i.description && i.description.toLowerCase().includes('b')) ||
               (i.properties && JSON.stringify(i.properties).toLowerCase().includes('b')))
    );
    
    if (possibleBWing.length > 0) {
    }
    
    // Count intersections by wing
    const aWingIntersections = intersectionData.filter(i => 
      i.wing && i.wing.toLowerCase().includes('a')
    );
    const bWingIntersections = intersectionData.filter(i => 
      i.wing && i.wing.toLowerCase().includes('b')
    );
    const unknownWingIntersections = intersectionData.filter(i => 
      !i.wing || (!i.wing.toLowerCase().includes('a') && !i.wing.toLowerCase().includes('b'))
    );
    
    
    // Check cross-wing connections
    let crossWingConnections = 0;
    let forcedConnections = 0;
    const crossWingPairs = [];
    
    intersectionData.forEach(intersection => {
      intersection.connections.forEach(conn => {
        const targetIntersection = intersectionData.find(i => i.id === conn.targetId);
        if (targetIntersection && intersection.wing !== targetIntersection.wing) {
          crossWingConnections++;
          if (conn.pathType && (conn.pathType.includes('forced') || conn.pathType.includes('balanced-cross-wing'))) {
            forcedConnections++;
          }
          crossWingPairs.push(`${intersection.id} (${intersection.wing}) ↔ ${targetIntersection.id} (${targetIntersection.wing}) [${conn.pathType || 'original'}]`);
        }
      });
    });
    
    
    const actualCrossWingConnections = crossWingConnections / 2; // Bidirectional, so divide by 2
    
    if (actualCrossWingConnections === 0) {
      setDebugInfo(`❌ No cross-wing connections found`);
    } else {
      // Show first few connections as examples
      setDebugInfo(`✅ ${actualCrossWingConnections} cross-wing connections found (${forcedConnections / 2} forced)`);
    }
    
  };

  // NEW: Debug intersection network function
  const debugIntersectionNetwork = () => {
    
    const typeCount = {};
    const connectionCount = {};
    
    intersectionData.forEach(intersection => {
      // Count by type
      typeCount[intersection.type] = (typeCount[intersection.type] || 0) + 1;
      
      // Count connections
      const connCount = intersection.connections.length;
      connectionCount[connCount] = (connectionCount[connCount] || 0) + 1;
    });
    
    
    // Log intersections with no connections (potential issues)
    const isolated = intersectionData.filter(i => i.connections.length === 0);
    if (isolated.length > 0) {
    }
    
    setDebugInfo(`Debug: ${intersectionData.length} intersections, ${isolated.length} isolated`);
  };

  // NEW: Clear forced cross-wing connections
  const clearForcedConnections = () => {
    let cleared = 0;
    
    const cleanedData = intersectionData.map(intersection => {
      const originalLength = intersection.connections.length;
      const cleanedConnections = intersection.connections.filter(conn => 
        !conn.pathType || 
        (!conn.pathType.includes('forced') && 
         !conn.pathType.includes('corridor-cross-wing') && 
         !conn.pathType.includes('balanced-cross-wing'))
      );
      cleared += originalLength - cleanedConnections.length;
      
      return {
        ...intersection,
        connections: cleanedConnections
      };
    });
    
    // Update state with cleaned data
    setIntersectionData(cleanedData);
    return cleared;
  };

  // NEW: Force create cross-wing connections if missing
  const forceCreateCrossWingConnections = () => {
    
    if (intersectionData.length === 0) {
      setDebugInfo('No intersection data to work with');
      return;
    }
    
    // Work with fresh data after clearing
    const clearedCount = clearForcedConnections();
    
    // Get fresh intersection data reference after clearing
    const freshIntersectionData = intersectionData;
    
    // Find A-wing and B-wing intersections
    const aWingIntersections = freshIntersectionData.filter(i => 
      i.wing && i.wing.toLowerCase().includes('a')
    );
    const bWingIntersections = freshIntersectionData.filter(i => 
      i.wing && i.wing.toLowerCase().includes('b')
    );
    
    
    if (aWingIntersections.length === 0 || bWingIntersections.length === 0) {
      setDebugInfo('Could not identify wing intersections');
      return;
    }
    
    // Find closest pairs between wings and force connections
    let connectionsCreated = 0;
    const maxDistance = 80; // More reasonable distance
    
    // More permissive intersection types - include room entrances near corridors
    const connectableTypes = ['corridor_junction', 'corridor_turn', 'staircase_entrance', 'elevator_entrance', 'room_entrance'];
    
    
    // Filter to only connectable intersection types, but be more inclusive
    const connectableAWing = aWingIntersections.filter(i => connectableTypes.includes(i.type));
    const connectableBWing = bWingIntersections.filter(i => connectableTypes.includes(i.type));
    
    
    // If no connectable types found, use all intersection types as fallback
    let finalAWing = connectableAWing.length > 0 ? connectableAWing : aWingIntersections;
    let finalBWing = connectableBWing.length > 0 ? connectableBWing : bWingIntersections;
    
    if (connectableAWing.length === 0 || connectableBWing.length === 0) {
      finalAWing = aWingIntersections;
      finalBWing = bWingIntersections;
    }
    
    // Use setTimeout to ensure state update has completed
    setTimeout(() => {
      // Get the current intersection data after clearing
      const currentData = intersectionData;
      let actualConnectionsCreated = 0;
      
      finalAWing.forEach((aIntersection, aIndex) => {
        const aGlobalIndex = currentData.findIndex(i => i.id === aIntersection.id);
        if (aGlobalIndex === -1) return;
        
        finalBWing.forEach((bIntersection, bIndex) => {
          const bGlobalIndex = currentData.findIndex(i => i.id === bIntersection.id);
          if (bGlobalIndex === -1) return;
          
          const distance = calculateDistance(aIntersection.coordinates, bIntersection.coordinates);
          
          if (distance <= maxDistance) {
            // Check if connection already exists
            const connectionExists = currentData[aGlobalIndex].connections.some(conn => conn.targetId === bIntersection.id);
            
            if (!connectionExists) {
              const weight = distance * 1.8; // Penalty for cross-wing
              
              // Add connections directly to the current data
              currentData[aGlobalIndex].connections.push({
                targetId: bIntersection.id,
                targetIndex: bGlobalIndex,
                distance: distance,
                weight: weight,
                pathType: 'balanced-cross-wing'
              });
              
              currentData[bGlobalIndex].connections.push({
                targetId: aIntersection.id,
                targetIndex: aGlobalIndex,
                distance: distance,
                weight: weight,
                pathType: 'balanced-cross-wing'
              });
              
              actualConnectionsCreated++;
            }
          }
        });
      });
      
      // Force state update
      setIntersectionData([...currentData]);
      setDebugInfo(`Created ${actualConnectionsCreated} cross-wing connections`);
      
    }, 200); // Wait for clear to complete
  };

  // NEW: Test navigation system with sample routes
  const testNavigationSystem = () => {
    
    if (intersectionData.length < 2) {
      setDebugInfo('Need at least 2 intersections for testing');
      return;
    }
    
    // Test with a sample route between two random intersections
    const junctions = intersectionData.filter(i => i.type === 'corridor_junction');
    const turns = intersectionData.filter(i => i.type === 'corridor_turn');
    const entrances = intersectionData.filter(i => i.type === 'room_entrance');
    
    let testStart, testEnd;
    
    if (junctions.length >= 2) {
      testStart = junctions[0];
      testEnd = junctions[1];
    } else if (turns.length >= 2) {
      testStart = turns[0];
      testEnd = turns[1];
    } else {
      testStart = intersectionData[0];
      testEnd = intersectionData[Math.min(1, intersectionData.length - 1)];
    }
    
    
    // Simulate room data for testing
    const testStartRoom = {
      displayName: `Test Start (${testStart.type})`,
      coordinates: testStart.coordinates,
      intersectionId: testStart.id,
      isIntersection: true
    };
    
    const testEndRoom = {
      displayName: `Test End (${testEnd.type})`,
      coordinates: testEnd.coordinates,
      intersectionId: testEnd.id,
      isIntersection: true
    };
    
    // Set test rooms and calculate route
    setStartRoom(testStartRoom);
    setEndRoom(testEndRoom);
    setStartRoomInput(testStartRoom.displayName);
    setEndRoomInput(testEndRoom.displayName);
    
    // Highlight test points
    highlightRoom(testStart.coordinates, 'start');
    highlightRoom(testEnd.coordinates, 'end');
    
    // Calculate the test route
    setTimeout(() => {
      calculateIntersectionNavigationRoute();
      setDebugInfo(`Test route: ${testStart.id} → ${testEnd.id}`);
    }, 500);
    
  };

  // Initialize map
  useEffect(() => {

    mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaGFkaW5pIiwiYSI6ImNtYjBxdnlzczAwNmUyanE0ejhqdnNibGMifQ.39lNqpWtEZ_flmjVch2V5g';

    fetchRoomDataWithIntersections(); // UPDATED: Use new function

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kushadini/cmclf9u4f008z01s01mg44i6x',
      center: [-74.5, 40],
      zoom: 9
    });

    mapRef.current.on('load', () => {
      setDebugInfo('Map loaded successfully!');

      mapRef.current.flyTo({
        center: [-80.402816, 43.390824],
        zoom: 19,
        pitch: 45
      });

      // Set initial user location
      setUserLocation(mapRef.current.getCenter().toArray());

      setIsMapReady(true);
    });

    mapRef.current.on('move', () => {
      setUserLocation(mapRef.current.getCenter().toArray());
    });

    mapRef.current.on('error', (e) => {
      setDebugInfo('Map error occurred');
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Set up room interactions when both map and data are ready
  useEffect(() => {
    if (isMapReady && isDataReady) {
      initializeLayers();
      setupRoomInteractions();
      showFloorOnly(currentFloor);
    }
  }, [isMapReady, isDataReady]);

  const initializeLayers = () => {
    setDebugInfo('Setting up layers...');
    
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      return;
    }
    
    const allRoomLayers = [
      'a-wing-level-1-fill', 'a-wing-level-1-borders', 'a-wing-level-1-label',
      'a-wing-level-2-fill', 'a-wing-level-2-borders', 'a-wing-level-2-label',
      'a-wing-level-3-fill', 'a-wing-level-3-borders', 'a-wing-level-3-label',
      'b-wing-level-1-fill', 'b-wing-level-1-borders', 'b-wing-level-1-label',
      'b-wing-level-2-fill', 'b-wing-level-2-borders', 'b-wing-level-2-label',
      'b-wing-level-3-fill', 'b-wing-level-3-borders', 'b-wing-level-3-label'
    ];
    
    // Log all layers for debugging

    allRoomLayers.forEach(layerId => {
      try {
        mapRef.current.setPaintProperty(layerId, 'text-opacity', 1);
        mapRef.current.setPaintProperty(layerId, 'text-halo-color', '#ffffff');
        mapRef.current.setPaintProperty(layerId, 'text-halo-width', 1);
      } catch (e) {
      }
    });
    
    allRoomLayers.forEach(layerId => {
      try {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
      } catch (e) {
      }
    });
    
    setDebugInfo('Layers initialized');
  };

  const setupRoomInteractions = () => {
    
    const fillLayers = [
      'a-wing-level-1-fill', 'a-wing-level-2-fill', 'a-wing-level-3-fill',
      'b-wing-level-1-fill', 'b-wing-level-2-fill', 'b-wing-level-3-fill'
    ];
    
    fillLayers.forEach(layerId => {
      try {
        mapRef.current.off('click', layerId);
        mapRef.current.off('mouseenter', layerId);
        mapRef.current.off('mouseleave', layerId);
        
        mapRef.current.on('click', layerId, (e) => {
          if (e.features.length > 0) {
            const feature = e.features[0];
            const geometry = feature.geometry;
            const wing = layerId.includes('a-wing') ? 'A Wing' : 'B Wing';
            
            let foundRoomData = {};
            let matchedKey = null;
            
            if (geometry && geometry.coordinates && geometry.coordinates[0]) {
              const centerCoords = calculatePolygonCenter(geometry.coordinates);
              if (centerCoords) {
                const result = findRoomData(centerCoords[0], centerCoords[1], roomData);
                foundRoomData = result.data;
                matchedKey = result.matchedKey;
              }
            }
            
            setSelectedRoom({
              id: foundRoomData.location_numk || foundRoomData.location_number || foundRoomData.location_id || foundRoomData.room_number || foundRoomData.room_id || 'Unknown',
              name: foundRoomData.location_name || foundRoomData.location_numk || foundRoomData.location_number || foundRoomData.room_number || foundRoomData.name || `${wing} Room`,
              floor: currentFloor,
              wing: wing,
              type: foundRoomData.location_type || foundRoomData.room_type || foundRoomData.type || 'Office',
              status: foundRoomData.status || 'Available', 
              equipment: foundRoomData.equipment || 'Standard office equipment',
              description: foundRoomData.description || 'No description available'
            });
          }
        });
        
        mapRef.current.on('mouseenter', layerId, () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });
        
        mapRef.current.on('mouseleave', layerId, () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
        
      } catch (error) {
      }
    });
    
  };

  const showFloorOnly = (floor) => {
    setDebugInfo(`Switching to floor ${floor}...`);
    
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      setTimeout(() => showFloorOnly(floor), 500);
      return;
    }
    
    const allFloorLayers = [
      'a-wing-level-1-fill', 'a-wing-level-1-borders', 'a-wing-level-1-label',
      'a-wing-level-2-fill', 'a-wing-level-2-borders', 'a-wing-level-2-label',
      'a-wing-level-3-fill', 'a-wing-level-3-borders', 'a-wing-level-3-label',
      'b-wing-level-1-fill', 'b-wing-level-1-borders', 'b-wing-level-1-label',
      'b-wing-level-2-fill', 'b-wing-level-2-borders', 'b-wing-level-2-label',
      'b-wing-level-3-fill', 'b-wing-level-3-borders', 'b-wing-level-3-label'
    ];
    
    // Hide ALL layers first
    allFloorLayers.forEach(layerId => {
      try {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
      } catch (e) {
      }
    });
    
    setTimeout(() => {
      // Show only the layers for the selected floor
      const currentFloorLayers = [
        `a-wing-level-${floor}-fill`,
        `a-wing-level-${floor}-borders`,
        `a-wing-level-${floor}-label`,
        `b-wing-level-${floor}-fill`,
        `b-wing-level-${floor}-borders`,
        `b-wing-level-${floor}-label`
      ];
      
      let visibleCount = 0;
      currentFloorLayers.forEach(layerId => {
        try {
          const layer = mapRef.current.getLayer(layerId);
          if (layer) {
            mapRef.current.setLayoutProperty(layerId, 'visibility', 'visible');
            visibleCount++;
          } else {
          }
        } catch (e) {
        }
      });
      
      setDebugInfo(`Floor ${floor} - ${visibleCount}/6 layers visible (A & B Wings)`);
      
      mapRef.current.triggerRepaint();
      
    }, 100);
    
  };

  const switchFloor = (floor) => {
    setCurrentFloor(floor);
    showFloorOnly(floor);
    setSelectedRoom(null);
    
    // Update room highlighting based on new floor
    if (startRoom && startRoom.floor === floor) {
      highlightRoom(startRoom.coordinates, 'start');
    }
    if (endRoom && endRoom.floor === floor) {
      highlightRoom(endRoom.coordinates, 'end');
    }
    
    // Check if there's a pending cross-floor route for this floor
    if (window.pendingCrossFloorRoute && window.pendingCrossFloorRoute.targetFloor === floor) {
      const routeData = window.pendingCrossFloorRoute;
      
      // Display the continuation route from transport to destination
      displayRoute(routeData.destinationRoute);
      
      // Update debug info
      setDebugInfo(`Showing route from ${routeData.transportType} to destination on floor ${floor}`);
      
      // Clear the pending route data
      window.pendingCrossFloorRoute = null;
    } else {
      // Clear navigation when switching floors (only if no pending route)
      clearNavigation();
    }
    
    setTimeout(() => {
      if (floor !== 3) {
        forceHideLevel3Labels();
      }
    }, 200);
  };

  const forceHideLevel3Labels = () => {
    const level3LabelLayers = [
      'a-wing-level-3-label',
      'b-wing-level-3-label'
    ];
    
    level3LabelLayers.forEach(layerId => {
      try {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
      } catch (e) {
      }
    });
    
    mapRef.current.triggerRepaint();
  };

  const toggle3D = () => {
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    mapRef.current.flyTo({
      pitch: newIs3D ? 45 : 0,
      duration: 1000
    });
  };

  const resetView = () => {
    mapRef.current.flyTo({
      center: [-80.402816, 43.390824],
      zoom: 19,
      pitch: is3D ? 45 : 0,
      bearing: 0,
      duration: 1000
    });
    setSelectedRoom(null);
  };

  return (
    <div className={`map-page ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
      {/* Map Section */}
      <div className="map-container-wrapper position-relative">
        <div 
          ref={mapContainerRef}
          className="map-container"
          style={{ height: '500px', width: '100%' }}
        />
        
        {/* Floor Switcher - LEFT SIDE */}
        <div className="position-absolute" style={{ top: '20px', left: '20px', zIndex: 1000 }}>
          <Card className={`shadow ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
            <Card.Body className="text-center p-3">
              <h6 className="mb-3">Floor</h6>
              {[3, 2, 1].map(floor => (
                <Button
                  key={floor}
                  variant={currentFloor === floor ? "primary" : "outline-secondary"}
                  className="d-block w-100 mb-2"
                  style={{ minWidth: '60px', minHeight: '50px' }}
                  onClick={() => switchFloor(floor)}
                  disabled={!isMapReady}
                >
                  {floor}
                </Button>
              ))}
            </Card.Body>
          </Card>
        </div>

        {/* Navigation Panel - RIGHT SIDE BELOW MAP CONTROLS */}
        <div className="position-absolute" style={{ top: '210px', right: '20px', zIndex: 1000 }}>
          <Card className={`shadow ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`} style={{ width: '300px' }}>
            <Card.Header>
              <h6 className="mb-0">Navigation</h6>
            </Card.Header>
            <Card.Body className="p-3">
              {/* Start Room Input */}
              <div className="mb-3">
                <label className="form-label small nav-label-color">From (Room Name/Number):</label>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2A202, Classroom, Staircase..."
                    value={startRoomInput}
                    onChange={(e) => {
                      setStartRoomInput(e.target.value);
                      searchRoomsWithIntersections(e.target.value, true); // UPDATED: Use new function
                    }}
                  />
                  {startRoom && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setStartRoom(null);
                        setStartRoomInput('');
                        setRouteSearchResults(prev => ({ ...prev, start: [] }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
                
                {/* Start Room Search Results */}
                {routeSearchResults.start.length > 0 && (
                  <div className="mt-1">
                    <div className="list-group" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {routeSearchResults.start.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action py-1 px-2 small"
                          onClick={() => selectRoomForNavigation(result, true)}
                        >
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold">{result.displayName}</span>
                            <Badge bg="secondary">{result.displayNumber}</Badge>
                          </div>
                          <small className="text-muted">Match: {result.matchType}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* End Room Input */}
              <div className="mb-3">
                <label className="form-label small nav-label-color">To (Room Name/Number):</label>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2A202, Classroom, Elevator..."
                    value={endRoomInput}
                    onChange={(e) => {
                      setEndRoomInput(e.target.value);
                      searchRoomsWithIntersections(e.target.value, false); // UPDATED: Use new function
                    }}
                  />
                  {endRoom && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => {
                        setEndRoom(null);
                        setEndRoomInput('');
                        setRouteSearchResults(prev => ({ ...prev, end: [] }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </InputGroup>
                
                {/* End Room Search Results */}
                {routeSearchResults.end.length > 0 && (
                  <div className="mt-1">
                    <div className="list-group" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {routeSearchResults.end.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action py-1 px-2 small"
                          onClick={() => selectRoomForNavigation(result, false)}
                        >
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold">{result.displayName}</span>
                            <Badge bg="secondary">{result.displayNumber}</Badge>
                          </div>
                          <small className="text-muted">Match: {result.matchType}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={calculateIntersectionNavigationRoute} // UPDATED: Use new function
                  disabled={!isDataReady || !startRoom || !endRoom}
                >
                  Get Directions
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={clearNavigation}
                  disabled={!startRoom && !endRoom && !currentRoute}
                >
                  Clear Navigation
                </Button>
              </div>

              {/* Route Info */}

              {/* Selected Rooms Display */}
              {(startRoom || endRoom) && (
                <div className="mt-3">
                  {startRoom && (
                    <div className="d-flex align-items-center mb-1">
                      <small>Start: {startRoom.displayName}</small>
                    </div>
                  )}
                  {endRoom && (
                    <div className="d-flex align-items-center">
                      <small>End: {endRoom.displayName}</small>
                    </div>
                  )}
                </div>
              )}

            </Card.Body>
          </Card>
        </div>

        {/* Map Controls - RIGHT SIDE */}
        <div className="position-absolute" style={{ top: '20px', right: '20px', zIndex: 1000 }}>
          <div className="d-flex flex-column gap-2">
            <Button 
              variant="warning" 
              onClick={toggle3D}
              disabled={!isMapReady}
              style={{ minWidth: '100px' }}
            >
              Toggle 3D
            </Button>
            <Button 
              variant="secondary" 
              onClick={resetView}
              disabled={!isMapReady}
              style={{ minWidth: '100px' }}
            >
              Reset View
            </Button>
            <Button 
              variant="info" 
              onClick={() => showFloorOnly(currentFloor)}
              disabled={!isMapReady}
              style={{ minWidth: '100px' }}
              size="sm"
            >
              Refresh Floor
            </Button>
          </div>
        </div>
      </div>

      {/* Information Panel Below */}
      <Container fluid className="py-4">
        <Row>
          {/* Selected Room Info */}
          <Col lg={12}>
            {selectedRoom ? (
              <Card className={`shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
                <Card.Header>
                  <h5 className="mb-0">Location Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h4 className="text-primary">{selectedRoom.name}</h4>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Location Number:</strong></td>
                            <td>{selectedRoom.id}</td>
                          </tr>
                          <tr>
                            <td><strong>Floor:</strong></td>
                            <td>Level {selectedRoom.floor}</td>
                          </tr>
                          <tr>
                            <td><strong>Wing:</strong></td>
                            <td>{selectedRoom.wing}</td>
                          </tr>
                          <tr>
                            <td><strong>Type:</strong></td>
                            <td>{selectedRoom.type}</td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td>{selectedRoom.status}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    <Col md={6}>
                      <h6>Equipment</h6>
                      <p className="mb-3">{selectedRoom.equipment}</p>
                      
                      {selectedRoom.description && selectedRoom.description !== 'No description available' && (
                        <>
                          <h6>Description</h6>
                          <p>{selectedRoom.description}</p>
                        </>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ) : (
              <Card className={`shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
                <Card.Body>
                  <p className="text-muted mb-0">Click on a room on the map to see its details here.</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      
      {/* Transport Selection Modal */}
      <Modal show={showTransportModal} onHide={() => setShowTransportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Transportation Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Your destination is on a different floor. Please choose how you'd like to get there:
          </p>
          
          {pendingNavigation && (
            <div className="mb-3 p-2 bg-light rounded">
              <small className="text-muted">
                From: Floor {pendingNavigation.startFloor} → Floor {pendingNavigation.endFloor}
              </small>
              {pendingNavigation.endFloor === 3 && (
                <div className="mt-2">
                  <small className="text-info">
                    <i className="fas fa-info-circle me-1"></i>
                    Floor 3 wings are not connected - you must use the transport in the correct wing
                  </small>
                </div>
              )}
            </div>
          )}
          
          <div className="d-grid gap-2">
            {availableTransports.map((transport, index) => (
              <Button
                key={index}
                variant={transport.type === 'stairs' ? 'outline-primary' : 'outline-success'}
                className="p-3 text-start"
                onClick={() => selectTransport(transport)}
              >
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {transport.icon === 'stairs' ? (
                      <i className="fas fa-walking" style={{ fontSize: '1.5rem' }}></i>
                    ) : (
                      <i className="fas fa-elevator" style={{ fontSize: '1.5rem' }}></i>
                    )}
                  </div>
                  <div>
                    <div className="fw-bold">
                      {transport.label}
                    </div>
                    <small className="text-muted">
                      {transport.description}
                    </small>
                  </div>
                </div>
              </Button>
            ))}
          </div>
          
          {availableTransports.length === 0 && (
            <div className="text-center text-muted">
              <i className="fas fa-exclamation-triangle me-2"></i>
              No transportation options found between these floors.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransportModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Map;
