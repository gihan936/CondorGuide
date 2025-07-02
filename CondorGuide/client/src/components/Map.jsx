import React, { useEffect, useRef, useContext } from 'react';
import { Card, Button, Badge, Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
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
  
  // Navigation state
  const [startRoomInput, setStartRoomInput] = React.useState('');
  const [endRoomInput, setEndRoomInput] = React.useState('');
  const [startRoom, setStartRoom] = React.useState(null);
  const [endRoom, setEndRoom] = React.useState(null);
  const [routeSearchResults, setRouteSearchResults] = React.useState({ start: [], end: [] });
  const [currentRoute, setCurrentRoute] = React.useState(null);
  const animationFrameRef = React.useRef(null);
  const [userLocation, setUserLocation] = React.useState(null); // New state for user's current map center

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
      
      // Check location_numk (exact or partial match)
      if (roomData.location_numk && 
          roomData.location_numk.toString().toLowerCase().includes(searchTermLower)) {
        match = true;
        matchType = matchType ? 'Name & Number' : 'Number';
        matchScore = Math.max(matchScore, roomData.location_numk.toString() === searchTerm.trim() ? 100 : 75);
      }

      // Check other fields for backward compatibility
      if (roomData.room_number && 
          roomData.room_number.toString().toLowerCase().includes(searchTermLower)) {
        match = true;
        matchType = matchType ? matchType + ' & Legacy' : 'Legacy Number';
        matchScore = Math.max(matchScore, 60);
      }

      if (match) {
        results.push({
          key,
          data: roomData,
          matchType,
          matchScore,
          displayName: roomData.location_name || roomData.location_numk || roomData.room_number || 'Unknown',
          displayNumber: roomData.location_numk || roomData.room_number || 'N/A',
          coordinates: key.split(',').map(Number)
        });
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

  // Find nearest location of a specific type
  const findNearestLocationOfType = (type, referenceCoords) => {
    let nearestRoom = null;
    let minDistance = Infinity;

    Object.values(roomData).forEach(room => {
      // Ensure room has a location_type property and coordinates
      if (room.location_type && room.center_coordinates) {
        if (room.location_type.toLowerCase() === type.toLowerCase()) {
          const distance = calculateDistance(referenceCoords, room.center_coordinates);
          if (distance < minDistance) {
            minDistance = distance;
            nearestRoom = {
              key: `${room.center_coordinates[0]},${room.center_coordinates[1]}`,
              data: room,
              matchType: 'Type',
              matchScore: 100,
              displayName: room.location_name || room.location_numk || room.room_number || 'Unknown',
              displayNumber: room.location_numk || room.room_number || 'N/A',
              coordinates: room.center_coordinates
            };
          }
        }
      }
    });
    return nearestRoom;
  };

  // Fetch room data from datasets API
  const fetchRoomData = async () => {
    try {
      setDebugInfo('Fetching room and route data from datasets...');
      
      const datasetIds = [
        'cmbhf0ndq2kld1on5g332amn7',
        'cmbfb8tar52id1ump75xqao9r', 
        'cmbhf2g8t36tf1pna7q2ed3bu',
        'cmcmdryk90m2n1oo72ki4jmxm' // New A-Wing-level-2-hallways dataset
      ];
      
      const allRoomData = {};
      const allHallwayData = {};
      
      for (const datasetId of datasetIds) {
        try {
          const response = await fetch(`https://api.mapbox.com/datasets/v1/kushadini/${datasetId}/features?access_token=${mapboxgl.accessToken}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`Dataset ${datasetId} data:`, data);
            if (datasetId === 'cmcmdryk90m2n1oo72ki4jmxm') {
              console.log('CONFIRMED: A-Wing-level-2-hallways dataset loaded successfully!');
            }
            
            data.features.forEach(feature => {
              if (feature.geometry && feature.properties) {
                console.log(`Processing feature: type=${feature.geometry.type}, properties=`, feature.properties);
                
                // Check if this is a hallway (LineString) or room (Polygon)
                if (feature.geometry.type === 'LineString' && feature.properties.hallway_id) {
                  // This is a hallway feature
                  const hallwayId = feature.properties.hallway_id;
                  if (!allHallwayData[hallwayId]) {
                    allHallwayData[hallwayId] = [];
                  }
                  allHallwayData[hallwayId].push(feature);
                  console.log(`Added hallway segment: ${hallwayId}`);
                  
                } else if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
                  // This is a room feature
                  const centerCoords = calculatePolygonCenter(feature.geometry.coordinates);
                  if (centerCoords) {
                    const keys = generateCoordinateKeys(centerCoords[0], centerCoords[1]);
                    keys.forEach(key => {
                      allRoomData[key] = {
                        ...feature.properties,
                        center_coordinates: centerCoords,
                        geometry: feature.geometry
                      };
                    });
                  }
                  console.log(`Added room: ${feature.properties.location_name || feature.properties.location_numk}`);
                } else {
                  console.log(`Skipping feature with unexpected geometry type: ${feature.geometry.type}`);
                }
              }
            });
          }
        } catch (err) {
          console.log(`Could not fetch dataset ${datasetId}:`, err);
        }
      }
      
      setRoomData(allRoomData);
      setHallwayData(allHallwayData);
      
      console.log('=== DATA LOADED ===');
      console.log('Total room entries:', Object.keys(allRoomData).length);
      console.log('Hallway networks:', Object.keys(allHallwayData));
      Object.entries(allHallwayData).forEach(([id, segments]) => {
        console.log(`${id}: ${segments.length} segments`);
      });
      console.log('========================');
      
      setDebugInfo(`Data loaded: ${Object.keys(allRoomData).length} rooms, ${Object.keys(allHallwayData).length} hallway networks`);
      setIsDataReady(true);
      
    } catch (error) {
      console.error('Error fetching room data:', error);
      setDebugInfo('Error loading room data');
      setIsDataReady(true);
    }
  };

  // Search for rooms based on input
  const searchRooms = (searchTerm, isStart = true) => {
    if (!searchTerm.trim()) {
      if (isStart) {
        setRouteSearchResults(prev => ({ ...prev, start: [] }));
      } else {
        setRouteSearchResults(prev => ({ ...prev, end: [] }));
      }
      return;
    }

    const knownLocationTypes = ['washroom', 'staircase', 'elevator', 'exit', 'entrance', 'cafe', 'library', 'lab'];
    const searchTermLower = searchTerm.toLowerCase().trim();

    let results = [];

    // Check if the search term is a known location type
    if (knownLocationTypes.includes(searchTermLower)) {
      const referenceCoords = isStart && startRoom ? startRoom.coordinates : userLocation;
      if (referenceCoords) {
        const nearestLocation = findNearestLocationOfType(searchTermLower, referenceCoords);
        if (nearestLocation) {
          results = [nearestLocation]; // Only one result for nearest
        }
      } else {
        // If no reference coords, just list all of that type (or a few)
        Object.values(roomData).forEach(room => {
          if (room.location_type && room.location_type.toLowerCase() === searchTermLower) {
            results.push({
              key: `${room.center_coordinates[0]},${room.center_coordinates[1]}`,
              data: room,
              matchType: 'Type',
              matchScore: 100,
              displayName: room.location_name || room.location_numk || room.room_number || 'Unknown',
              displayNumber: room.location_numk || room.room_number || 'N/A',
              coordinates: room.center_coordinates
            });
          }
        });
        results = results.slice(0, 5); // Limit results for types
      }
    } else {
      // Fallback to existing room name/number search
      results = findRoomByNameOrNumber(searchTerm, roomData);
    }
    
    const limitedResults = results.slice(0, 5); // Limit to 5 results

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

    const roomInfo = {
      ...roomResult,
      coordinates
    };

    if (isStart) {
      setStartRoom(roomInfo);
      setStartRoomInput(roomResult.displayName);
      setRouteSearchResults(prev => ({ ...prev, start: [] }));
      highlightRoom(coordinates, 'start');
    } else {
      setEndRoom(roomInfo);
      setEndRoomInput(roomResult.displayName);
      setRouteSearchResults(prev => ({ ...prev, end: [] }));
      highlightRoom(coordinates, 'end');
    }

    console.log(`Selected ${isStart ? 'start' : 'end'} room:`, roomInfo);
    console.log('Selected room geometry:', roomInfo.data.geometry);
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

  // Find intersection points between LineString segments
  const findLineIntersections = (hallwaySegments) => {
    console.log('Finding intersection points between hallway segments...');
    const intersections = [];
    const tolerance = 2; // 2 meters tolerance for intersection detection
    
    for (let i = 0; i < hallwaySegments.length; i++) {
      for (let j = i + 1; j < hallwaySegments.length; j++) {
        const segment1 = hallwaySegments[i];
        const segment2 = hallwaySegments[j];
        
        if (!segment1.geometry?.coordinates || !segment2.geometry?.coordinates) continue;
        
        const coords1 = segment1.geometry.coordinates;
        const coords2 = segment2.geometry.coordinates;
        
        // Check all combinations of endpoints and line segments
        const segmentIntersections = findSegmentIntersections(coords1, coords2, tolerance);
        
        segmentIntersections.forEach(intersection => {
          intersections.push({
            ...intersection,
            segment1Index: i,
            segment2Index: j,
            segment1: segment1,
            segment2: segment2
          });
        });
      }
    }
    
    console.log(`Found ${intersections.length} intersection points`);
    return intersections;
  };

  // Enhanced intersection detection with better accuracy
  const findSegmentIntersections = (coords1, coords2, tolerance) => {
    const intersections = [];

    // Helper to calculate intersection point of two line segments
    const getIntersectionPoint = (p1, q1, p2, q2) => {
      const s1_x = q1[0] - p1[0];
      const s1_y = q1[1] - p1[1];
      const s2_x = q2[0] - p2[0];
      const s2_y = q2[1] - p2[1];

      const s = (-s1_y * (p1[0] - p2[0]) + s1_x * (p1[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
      const t = (s2_x * (p1[1] - p2[1]) - s2_y * (p1[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);

      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        // Collision detected
        const intX = p1[0] + (t * s1_x);
        const intY = p1[1] + (t * s1_y);
        return [intX, intY];
      }
      return null;
    };

    // Check endpoint-to-endpoint intersections
    const endpoints1 = [coords1[0], coords1[coords1.length - 1]];
    const endpoints2 = [coords2[0], coords2[coords2.length - 1]];

    endpoints1.forEach((end1, idx1) => {
      endpoints2.forEach((end2, idx2) => {
        const distance = calculateDistance(end1, end2);
        if (distance < tolerance) {
          intersections.push({
            point: [(end1[0] + end2[0]) / 2, (end1[1] + end2[1]) / 2],
            type: 'endpoint',
            distance: distance,
            segment1Point: end1,
            segment2Point: end2,
            segment1PointIndex: idx1 === 0 ? 0 : coords1.length - 1,
            segment2PointIndex: idx2 === 0 ? 0 : coords2.length - 1
          });
        }
      });
    });

    // Check endpoint-to-line intersections (T-junctions) - more comprehensive
    endpoints1.forEach((end1, idx1) => {
      for (let i = 0; i < coords2.length - 1; i++) {
        const p2 = coords2[i];
        const q2 = coords2[i + 1];
        if (lineIntersectsLine(end1, end1, p2, q2)) { // Treat endpoint as a tiny segment
          const intersectionPoint = getIntersectionPoint(end1, end1, p2, q2);
          if (intersectionPoint) {
            intersections.push({
              point: intersectionPoint,
              type: 'endpoint-to-line',
              distance: calculateDistance(end1, intersectionPoint),
              segment1Point: end1,
              segment2Point: intersectionPoint,
              segment1PointIndex: idx1 === 0 ? 0 : coords1.length - 1,
              segment2PointIndex: i // This is the start of the segment in coords2
            });
          }
        }
      }
    });

    endpoints2.forEach((end2, idx2) => {
      for (let i = 0; i < coords1.length - 1; i++) {
        const p1 = coords1[i];
        const q1 = coords1[i + 1];
        if (lineIntersectsLine(end2, end2, p1, q1)) { // Treat endpoint as a tiny segment
          const intersectionPoint = getIntersectionPoint(end2, end2, p1, q1);
          if (intersectionPoint) {
            intersections.push({
              point: intersectionPoint,
              type: 'line-to-endpoint',
              distance: calculateDistance(end2, intersectionPoint),
              segment1Point: intersectionPoint,
              segment2Point: end2,
              segment1PointIndex: i, // This is the start of the segment in coords1
              segment2PointIndex: idx2 === 0 ? 0 : coords2.length - 1
            });
          }
        }
      }
    });

    // Check for true mid-line intersections where hallways cross
    for (let i = 0; i < coords1.length - 1; i++) {
      const p1 = coords1[i];
      const q1 = coords1[i + 1];
      for (let j = 0; j < coords2.length - 1; j++) {
        const p2 = coords2[j];
        const q2 = coords2[j + 1];

        if (lineIntersectsLine(p1, q1, p2, q2)) {
          const intersectionPoint = getIntersectionPoint(p1, q1, p2, q2);
          if (intersectionPoint) {
            // Ensure it's not an endpoint intersection already covered
            const isEndpointIntersection =
              (calculateDistance(intersectionPoint, p1) < tolerance || calculateDistance(intersectionPoint, q1) < tolerance) &&
              (calculateDistance(intersectionPoint, p2) < tolerance || calculateDistance(intersectionPoint, q2) < tolerance);

            if (!isEndpointIntersection) {
              intersections.push({
                point: intersectionPoint,
                type: 'mid-line-crossing',
                distance: 0, // Exact intersection, distance is 0
                segment1Point: p1, // Start of segment 1
                segment2Point: p2, // Start of segment 2
                segment1PointIndex: i,
                segment2PointIndex: j
              });
            }
          }
        }
      }
    }

    return intersections;
  };

  
  const findClosestHallwayPoint = (targetPoint, hallwaySegments, roomPolygons, ignoredPolygon = null) => {
    console.log('Finding closest clear hallway point for:', targetPoint);
    let closestClearPoint = null;
    let minDistance = Infinity;

    hallwaySegments.forEach((segment) => {
      if (segment.geometry && segment.geometry.coordinates) {
        segment.geometry.coordinates.forEach((coord) => {
          const distance = calculateDistance(targetPoint, coord);
          if (distance < minDistance) {
            if (!doesLineIntersectRooms(targetPoint, coord, roomPolygons, ignoredPolygon)) {
              minDistance = distance;
              closestClearPoint = {
                point: coord,
                distance: distance,
              };
            }
          }
        });
      }
    });

    console.log('Closest clear point found:', closestClearPoint);
    return closestClearPoint;
  };

  // Build a graph using intersection points as nodes
  const buildIntersectionGraph = (intersections, hallwaySegments) => {
    const nodes = intersections.map((intersection, index) => ({
      id: index,
      coordinates: intersection.point,
      intersection: intersection,
      connections: []
    }));
    
    // Add connections between intersections that are on connected segments
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Check if these intersections share a common segment
        const shareSegment = (
          node1.intersection.segment1Index === node2.intersection.segment1Index ||
          node1.intersection.segment1Index === node2.intersection.segment2Index ||
          node1.intersection.segment2Index === node2.intersection.segment1Index ||
          node1.intersection.segment2Index === node2.intersection.segment2Index
        );
        
        if (shareSegment) {
          const distance = calculateDistance(node1.coordinates, node2.coordinates);
          node1.connections.push({ nodeId: j, distance: distance });
          node2.connections.push({ nodeId: i, distance: distance });
        }
      }
    }
    
    return { nodes, intersections };
  };

  // Simple shortest path through intersection nodes
  const findShortestIntersectionPath = (startNode, endNode, graph) => {
    const queue = [{ node: startNode, path: [startNode], distance: 0 }];
    const visited = new Set([startNode.id]);
    
    while (queue.length > 0) {
      // Sort by distance (simple Dijkstra-like approach)
      queue.sort((a, b) => a.distance - b.distance);
      const current = queue.shift();
      
      if (current.node.id === endNode.id) {
        return current.path;
      }
      
      current.node.connections.forEach(connection => {
        if (!visited.has(connection.nodeId)) {
          visited.add(connection.nodeId);
          const nextNode = graph.nodes[connection.nodeId];
          queue.push({
            node: nextNode,
            path: [...current.path, nextNode],
            distance: current.distance + connection.distance
          });
        }
      });
    }
    
    // No path found, return direct connection
    return [startNode, endNode];
  };

  // Find path through intersection points
  const findPathThroughIntersections = (startConnection, endConnection, intersectionGraph) => {
    // Find closest intersections to start and end points
    let startIntersection = null;
    let endIntersection = null;
    let minStartDist = Infinity;
    let minEndDist = Infinity;
    
    intersectionGraph.nodes.forEach(node => {
      const startDist = calculateDistance(startConnection.point, node.coordinates);
      const endDist = calculateDistance(endConnection.point, node.coordinates);
      
      if (startDist < minStartDist) {
        minStartDist = startDist;
        startIntersection = node;
      }
      
      if (endDist < minEndDist) {
        minEndDist = endDist;
        endIntersection = node;
      }
    });
    
    if (!startIntersection || !endIntersection) {
      console.log('Could not find intersection connections');
      return [];
    }
    
    if (startIntersection.id === endIntersection.id) {
      console.log('Start and end connect to same intersection');
      return [startIntersection.coordinates];
    }
    
    // Simple path finding through intersection graph
    const path = findShortestIntersectionPath(startIntersection, endIntersection, intersectionGraph);
    return path.map(node => node.coordinates);
  };

  // Check if a point is inside a polygon using ray casting algorithm
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

  // Helper function to determine orientation of ordered triplet (p, q, r)
  const orientation = (p, q, r) => {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (Math.abs(val) < 1e-9) return 0; // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
  };

  // Helper function to check if point q lies on segment pr
  const onSegment = (p, q, r) => {
    return (
      q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
      q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1])
    );
  };

  // Helper function to check if line segment 'p1q1' and 'p2q2' intersect.
  const lineIntersectsLine = (p1, q1, p2, q2) => {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case
    if (o1 !== o2 && o3 !== o4) {
      return true;
    }

    // Special Cases for collinear points
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
  };

  // Robust room collision detection using line-polygon intersection
  const doesLineIntersectRooms = (startPoint, endPoint, roomPolygons, ignoredPolygon = null) => {
    for (const roomPolygon of roomPolygons) {
      if (ignoredPolygon && JSON.stringify(roomPolygon) === JSON.stringify(ignoredPolygon)) {
        continue;
      }
      const polygonCoords = roomPolygon.coordinates[0]; // Get exterior ring

      // Check if the line segment intersects with any of the polygon's edges
      for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
        const p1 = polygonCoords[j];
        const q1 = polygonCoords[i];
        if (lineIntersectsLine(startPoint, endPoint, p1, q1)) {
          console.log(`Collision detected with a room polygon edge.`);
          return true;
        }
      }
    }
    return false;
  };

  // Get all room polygons from room data
  const getRoomPolygons = () => {
    const roomPolygons = [];
    
    Object.values(roomData).forEach(room => {
      if (room.geometry && room.geometry.type === 'Polygon' && room.geometry.coordinates) {
        roomPolygons.push(room.geometry);
      }
    });
    
    console.log(`Found ${roomPolygons.length} room polygons for collision detection`);
    return roomPolygons;
  };

  const createIntersectionBasedRoute = (startCoords, endCoords, hallwaySegments, startRoom, endRoom) => {
    console.log('--- Starting Intersection Based Route Creation ---');
    console.log('Start Coords:', startCoords, 'End Coords:', endCoords);

    const roomPolygons = getRoomPolygons();
    const intersections = findLineIntersections(hallwaySegments);

    if (intersections.length === 0) {
      console.log('No intersections found. Returning simple route.');
      return [startCoords, endCoords];
    }

    const startConnection = findClosestHallwayPoint(startCoords, hallwaySegments, roomPolygons, startRoom.data.geometry);
    const endConnection = findClosestHallwayPoint(endCoords, hallwaySegments, roomPolygons, endRoom.data.geometry);

    if (!startConnection || !endConnection) {
      console.log('Could not find a clear connection to the hallway network. Returning simple route.');
      return [startCoords, endCoords];
    }

    const intersectionGraph = buildIntersectionGraph(intersections, hallwaySegments);
    const intersectionPath = findPathThroughIntersections(startConnection, endConnection, intersectionGraph);

    if (intersectionPath.length === 0) {
      console.log('No path found through intersections. Returning simple route.');
      return [startCoords, endCoords];
    }

    const route = [startCoords, startConnection.point, ...intersectionPath, endConnection.point, endCoords];
    console.log('Initial route created:', route);

    const validatedRoute = validateAndRerouteAroundRooms(route, intersectionGraph, roomPolygons);
    console.log('--- Finished Intersection Based Route Creation ---');
    return validatedRoute;
  };

  // Find an alternative path using the intersection graph
  const findAlternativePathAroundRooms = (startPoint, endPoint, intersectionGraph, roomPolygons) => {
    console.log('Finding alternative path for segment:', startPoint, endPoint);
    const findClosestClearIntersection = (point, nodes) => {
      let closestNode = null;
      let minDistance = Infinity;
      for (const node of nodes) {
        const distance = calculateDistance(point, node.coordinates);
        if (distance < minDistance && !doesLineIntersectRooms(point, node.coordinates, roomPolygons)) {
          minDistance = distance;
          closestNode = node;
        }
      }
      return closestNode;
    };

    const startNode = findClosestClearIntersection(startPoint, intersectionGraph.nodes);
    const endNode = findClosestClearIntersection(endPoint, intersectionGraph.nodes);

    if (!startNode || !endNode) {
      console.warn('Could not find clear start/end nodes for rerouting.');
      return null;
    }

    const path = findShortestIntersectionPath(startNode, endNode, intersectionGraph);

    if (path && path.length > 0) {
      const finalPath = [startPoint, ...path.map(p => p.coordinates), endPoint];
      console.log('Found alternative path:', finalPath);
      return finalPath;
    }

    console.warn('Could not find an alternative path in the graph.');
    return null;
  };

  // Recursive route validation and rerouting
  const validateAndRerouteAroundRooms = (route, intersectionGraph, roomPolygons, depth = 0) => {
    console.log(`--- Validating route, depth: ${depth} ---`);
    if (depth > 10) {
      console.error('Max recursion depth reached in route validation.');
      return route;
    }

    let validatedRoute = [route[0]];
    let hasCollisions = false;

    for (let i = 0; i < route.length - 1; i++) {
      const startNode = route[i];
      const endNode = route[i + 1];

      if (doesLineIntersectRooms(startNode, endNode, roomPolygons)) {
        hasCollisions = true;
        console.log(`Collision detected between:', startNode, 'and', endNode`);

        const alternativePath = findAlternativePathAroundRooms(startNode, endNode, intersectionGraph, roomPolygons);

        if (alternativePath) {
          const validatedSubPath = validateAndRerouteAroundRooms(alternativePath, intersectionGraph, roomPolygons, depth + 1);
          validatedRoute.push(...validatedSubPath.slice(1));
        } else {
          console.warn('No alternative path found. Keeping original segment.');
          validatedRoute.push(endNode);
        }
      } else {
        validatedRoute.push(endNode);
      }
    }

    const cleanedRoute = validatedRoute.reduce((acc, point) => {
      if (acc.length === 0 || calculateDistance(acc[acc.length - 1], point) > 1) {
        acc.push(point);
      }
      return acc;
    }, []);

    if (hasCollisions) {
      console.log('Rerouting complete, running final validation...');
      return validateAndRerouteAroundRooms(cleanedRoute, intersectionGraph, roomPolygons, depth + 1);
    }

    console.log('--- Route validation successful ---');
    return cleanedRoute;
  };

  // Calculate navigation route with advanced pathfinding
  const calculateNavigationRoute = () => {
    if (!startRoom || !endRoom) {
      setDebugInfo('Please select both start and end rooms');
      return;
    }

    setDebugInfo('Calculating intelligent route...');
    console.log('=== CALCULATING NAVIGATION ROUTE ===');
    console.log('Start room:', startRoom);
    console.log('End room:', endRoom);
    console.log('Current floor:', currentFloor);
    
    try {
      const startCoords = startRoom.coordinates;
      const endCoords = endRoom.coordinates;
      
      console.log('Start coordinates:', startCoords);
      console.log('End coordinates:', endCoords);
      
      // Get hallway segments for current floor
      const wingA = `A${currentFloor}`;
      const wingB = `B${currentFloor}`;
      
      console.log('Available hallway networks:', Object.keys(hallwayData));
      console.log(`Looking for networks: ${wingA}, ${wingB}`);
      
      const availableSegments = [];
      if (hallwayData[wingA]) {
        availableSegments.push(...hallwayData[wingA]);
        console.log(`Added ${hallwayData[wingA].length} segments from ${wingA}`);
      }
      if (hallwayData[wingB]) {
        availableSegments.push(...hallwayData[wingB]);
        console.log(`Added ${hallwayData[wingB].length} segments from ${wingB}`);
      }
      
      if (availableSegments.length === 0) {
        console.log('No hallway data found, using simple route');
        const simpleRoute = [startCoords, endCoords];
        displayRoute(simpleRoute);
        return;
      }

      console.log(`Found ${availableSegments.length} hallway segments total`);

      const intelligentRoute = createIntersectionBasedRoute(startCoords, endCoords, availableSegments, startRoom, endRoom);
      console.log('Created intelligent route:', intelligentRoute);
      displayRoute(intelligentRoute);

    } catch (error) {
      console.error('Route calculation error:', error);
      setDebugInfo(`Route calculation failed: ${error.message}`);
      
      // Fallback to simple direct route
      try {
        const fallbackRoute = [startRoom.coordinates, endRoom.coordinates];
        displayRoute(fallbackRoute);
      } catch (fallbackError) {
        console.error('Even fallback route failed:', fallbackError);
      }
    }
  };

  // Display route on map
  const displayRoute = (routeCoordinates) => {
    console.log('=== DISPLAYING ROUTE ===');
    console.log('Route coordinates:', routeCoordinates);
    
    if (!routeCoordinates || routeCoordinates.length < 2) {
      console.error('Invalid route coordinates:', routeCoordinates);
      setDebugInfo('Invalid route data');
      return;
    }

    try {
      // Remove existing route layers
      const routeLayerId = 'navigation-route';
      const routeSourceId = 'navigation-route';
      
      if (mapRef.current.getLayer(routeLayerId)) {
        console.log('Removing existing route layer');
        mapRef.current.removeLayer(routeLayerId);
      }
      if (mapRef.current.getSource(routeSourceId)) {
        console.log('Removing existing route source');
        mapRef.current.removeSource(routeSourceId);
      }

      // Validate coordinates format
      const validCoordinates = routeCoordinates.filter(coord => {
        if (!coord || !Array.isArray(coord) || coord.length !== 2) {
          console.warn('Invalid coordinate:', coord);
          return false;
        }
        if (isNaN(coord[0]) || isNaN(coord[1])) {
          console.warn('NaN coordinate:', coord);
          return false;
        }
        return true;
      });

      if (validCoordinates.length < 2) {
        console.error('Not enough valid coordinates:', validCoordinates);
        setDebugInfo('Invalid coordinate data');
        return;
      }

      console.log('Valid coordinates for route:', validCoordinates);

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

      console.log('Route GeoJSON:', routeGeoJSON);

      // Add route source
      mapRef.current.addSource(routeSourceId, {
        type: 'geojson',
        data: routeGeoJSON
      });

      console.log('Added route source');

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

      console.log('Added route layer');

      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < validCoordinates.length - 1; i++) {
        const segmentDistance = calculateDistance(validCoordinates[i], validCoordinates[i + 1]);
        totalDistance += segmentDistance;
        console.log(`Segment ${i}: ${segmentDistance.toFixed(2)}m`);
      }

      const walkingTime = Math.round((totalDistance / 1.4) / 60);
      setCurrentRoute({ 
        coordinates: validCoordinates, 
        distance: totalDistance, 
        walkingTime 
      });
      
      console.log(`Total route distance: ${totalDistance.toFixed(2)}m`);
      console.log(`Estimated walking time: ${walkingTime} minutes`);
      
      setDebugInfo(`Intelligent route: ${Math.round(totalDistance)}m, ~${walkingTime} min walk`);

      // Fit map to show the route with padding
      const bounds = new mapboxgl.LngLatBounds();
      validCoordinates.forEach(coord => {
        bounds.extend(coord);
      });
      
      mapRef.current.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      });

      console.log('=== ROUTE DISPLAY COMPLETE ===');

    } catch (error) {
      console.error('Error displaying route:', error);
      setDebugInfo(`Route display failed: ${error.message}`);
    }
  };

  // Clear navigation
  const clearNavigation = () => {
    console.log('=== CLEARING NAVIGATION ===');
    
    try {
      // Clear route layers
      const routeLayerIds = ['navigation-route', 'navigation-route-background'];
      const routeSourceIds = ['navigation-route'];
      
      routeLayerIds.forEach(layerId => {
        if (mapRef.current.getLayer(layerId)) {
          console.log(`Removing layer: ${layerId}`);
          mapRef.current.removeLayer(layerId);
        }
      });
      
      routeSourceIds.forEach(sourceId => {
        if (mapRef.current.getSource(sourceId)) {
          console.log(`Removing source: ${sourceId}`);
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
      setDebugInfo('Navigation cleared');
      
      console.log('=== NAVIGATION CLEARED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('Error clearing navigation:', error);
      setDebugInfo(`Clear failed: ${error.message}`);
    }
  };

  // Calculate bearing between two points
  const calculateBearing = (coord1, coord2) => {
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  };

  // Enhanced debugging for route analysis
  const analyzeCurrentRoute = () => {
    console.log('=== ANALYZING CURRENT ROUTE ===');
    
    if (!currentRoute) {
      console.log('No current route to analyze');
      return;
    }
    
    console.log('Route coordinates:', currentRoute.coordinates);
    console.log('Total distance:', currentRoute.distance, 'meters');
    console.log('Walking time:', currentRoute.walkingTime, 'minutes');
    
    // Analyze each segment
    const coords = currentRoute.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const segmentDistance = calculateDistance(coords[i], coords[i + 1]);
      const bearing = calculateBearing(coords[i], coords[i + 1]);
      console.log(`Segment ${i + 1}: ${segmentDistance.toFixed(2)}m, bearing ${bearing.toFixed(1)}°`);
      console.log(`  From: [${coords[i][0].toFixed(6)}, ${coords[i][1].toFixed(6)}]`);
      console.log(`  To: [${coords[i + 1][0].toFixed(6)}, ${coords[i + 1][1].toFixed(6)}]`);
    }
    
    console.log('=== END ROUTE ANALYSIS ===');
  };

  // Debug the hallway network
  const debugHallwayNetwork = () => {
    console.log('=== DEBUGGING HALLWAY NETWORK ===');
    
    const wingA = `A${currentFloor}`;
    const availableSegments = hallwayData[wingA] || [];
    
    if (availableSegments.length === 0) {
      console.log('No hallway segments available');
      return;
    }
    
    console.log(`Found ${availableSegments.length} segments for ${wingA}`);
    
    // Test intersection finding
    const intersections = findLineIntersections(availableSegments);
    console.log(`Found ${intersections.length} intersections`);
    
    // Sample some coordinates from first few segments
    console.log('Sample coordinates from first 3 segments:');
    for (let i = 0; i < Math.min(3, availableSegments.length); i++) {
      const segment = availableSegments[i];
      if (segment.geometry && segment.geometry.coordinates) {
        console.log(`Segment ${i}:`, segment.geometry.coordinates.slice(0, 3));
      }
    }
    
    console.log('=== END NETWORK DEBUG ===');
  };

  // Visualize intersections
  const visualizeIntersections = () => {
    console.log('=== VISUALIZING INTERSECTIONS ===');
    
    const wingA = `A${currentFloor}`;
    const availableSegments = hallwayData[wingA] || [];
    
    if (availableSegments.length === 0) {
      console.log('No hallway segments available for intersection visualization');
      return;
    }
    
    // Find intersections
    const intersections = findLineIntersections(availableSegments);
    
    if (intersections.length === 0) {
      console.log('No intersections found to visualize');
      setDebugInfo('No intersections found on current floor');
      return;
    }
    
    // Remove existing visualization
    const vizLayerId = 'intersection-viz';
    const vizSourceId = 'intersection-viz';
    
    if (mapRef.current.getLayer(vizLayerId)) {
      mapRef.current.removeLayer(vizLayerId);
    }
    if (mapRef.current.getSource(vizSourceId)) {
      mapRef.current.removeSource(vizSourceId);
    }
    
    // Create GeoJSON for intersections
    const features = intersections.map((intersection, index) => ({
      type: 'Feature',
      properties: {
        intersectionIndex: index,
        type: intersection.type,
        distance: intersection.distance
      },
      geometry: {
        type: 'Point',
        coordinates: intersection.point
      }
    }));
    
    const intersectionGeoJSON = {
      type: 'FeatureCollection',
      features: features
    };
    
    console.log(`Visualizing ${features.length} intersection points`);
    
    // Add to map
    mapRef.current.addSource(vizSourceId, {
      type: 'geojson',
      data: intersectionGeoJSON
    });
    
    mapRef.current.addLayer({
      id: vizLayerId,
      type: 'circle',
      source: vizSourceId,
      paint: {
        'circle-radius': 8,
        'circle-color': '#FFD700', // Gold color
        'circle-opacity': 0.8,
        'circle-stroke-color': '#FF0000',
        'circle-stroke-width': 2
      }
    });
    
    setDebugInfo(`Showing ${intersections.length} intersection points (gold circles)`);
    console.log('Intersection visualization added (gold circles with red borders)');
    console.log('=== END INTERSECTION VISUALIZATION ===');
  };

  // Visualize hallway network for debugging
  const visualizeHallwayNetwork = () => {
    console.log('=== VISUALIZING HALLWAY NETWORK ===');
    
    const wingA = `A${currentFloor}`;
    const availableSegments = hallwayData[wingA] || [];
    
    if (availableSegments.length === 0) {
      console.log('No hallway segments available for visualization');
      return;
    }
    
    // Remove existing visualization
    const vizLayerId = 'hallway-network-viz';
    const vizSourceId = 'hallway-network-viz';
    
    if (mapRef.current.getLayer(vizLayerId)) {
      mapRef.current.removeLayer(vizLayerId);
    }
    if (mapRef.current.getSource(vizSourceId)) {
      mapRef.current.removeSource(vizSourceId);
    }
    
    // Create GeoJSON for all hallway segments
    const features = availableSegments.map((segment, index) => ({
      type: 'Feature',
      properties: {
        segmentIndex: index,
        hallway_id: segment.properties?.hallway_id || 'unknown'
      },
      geometry: segment.geometry
    }));
    
    const hallwayGeoJSON = {
      type: 'FeatureCollection',
      features: features
    };
    
    console.log(`Visualizing ${features.length} hallway segments`);
    
    // Add to map
    
    
    setDebugInfo(`Showing ${features.length} hallway segments (green dashed lines)`);
    console.log('Hallway network visualization added (green dashed lines)');
    console.log('=== END HALLWAY VISUALIZATION ===');
  };

  // Visualize room polygons for debugging
  const visualizeRoomPolygons = () => {
    console.log('=== VISUALIZING ROOM POLYGONS ===');
    
    const roomPolygons = getRoomPolygons();
    
    if (roomPolygons.length === 0) {
      console.log('No room polygons to visualize');
      return;
    }
    
    // Remove existing visualization
    const vizLayerId = 'room-polygons-viz';
    const vizSourceId = 'room-polygons-viz';
    
    if (mapRef.current.getLayer(vizLayerId)) {
      mapRef.current.removeLayer(vizLayerId);
    }
    if (mapRef.current.getSource(vizSourceId)) {
      mapRef.current.removeSource(vizSourceId);
    }
    
    // Create GeoJSON for room polygons
    const features = roomPolygons.map((polygon, index) => ({
      type: 'Feature',
      properties: {
        roomIndex: index
      },
      geometry: polygon
    }));
    
    const roomGeoJSON = {
      type: 'FeatureCollection',
      features: features
    };
    
    console.log(`Visualizing ${features.length} room polygons`);
    
    // Add to map with semi-transparent overlay
    mapRef.current.addSource(vizSourceId, {
      type: 'geojson',
      data: roomGeoJSON
    });
    
    mapRef.current.addLayer({
      id: vizLayerId,
      type: 'fill',
      source: vizSourceId,
      paint: {
        'fill-color': '#FF0000',
        'fill-opacity': 0.2,
        'fill-outline-color': '#FF0000'
      }
    });
    
    setDebugInfo(`Showing ${features.length} room polygons (red overlay)`);
    console.log('Room polygon visualization added (red overlay)');
    console.log('=== END ROOM POLYGON VISUALIZATION ===');
  };

  // Clear room polygon visualization
  const clearRoomVisualization = () => {
    const vizLayerId = 'room-polygons-viz';
    const vizSourceId = 'room-polygons-viz';
    
    if (mapRef.current && mapRef.current.getLayer(vizLayerId)) {
      mapRef.current.removeLayer(vizLayerId);
    }
    if (mapRef.current && mapRef.current.getSource(vizSourceId)) {
      mapRef.current.removeSource(vizSourceId);
    }
    
    console.log('Room polygon visualization cleared');
  };

  // Clear hallway visualization
  const clearHallwayVisualization = () => {
    const vizLayerId = 'hallway-network-viz';
    const vizSourceId = 'hallway-network-viz';
    
    if (mapRef.current && mapRef.current.getLayer(vizLayerId)) {
      mapRef.current.removeLayer(vizLayerId);
    }
    if (mapRef.current && mapRef.current.getSource(vizSourceId)) {
      mapRef.current.removeSource(vizSourceId);
    }
    
    console.log('Hallway visualization cleared');
  };

  // Initialize map
  useEffect(() => {
    console.log('=== INITIALIZING MAP ===');

    mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaGFkaW5pIiwiYSI6ImNtYjBxdnlzczAwNmUyanE0ejhqdnNibGMifQ.39lNqpWtEZ_flmjVch2V5g';

    fetchRoomData();

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kushadini/cmclf9u4f008z01s01mg44i6x',
      center: [-74.5, 40],
      zoom: 9
    });

    mapRef.current.on('load', () => {
      console.log('Map loaded successfully!');
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
      console.error('Mapbox error:', e);
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
      console.log('Both map and data ready, setting up room interactions...');
      initializeLayers();
      setupRoomInteractions();
      showFloorOnly(currentFloor);
    }
  }, [isMapReady, isDataReady]);

  const initializeLayers = () => {
    console.log('=== INITIALIZING LAYERS ===');
    setDebugInfo('Setting up layers...');
    
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      console.log('Map not ready yet');
      // If map is not ready, the useEffect will re-run when isMapReady becomes true
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
    console.log('All map style layers:', mapRef.current.getStyle().layers.map(layer => layer.id));

    allRoomLayers.forEach(layerId => {
      try {
        mapRef.current.setPaintProperty(layerId, 'text-opacity', 1);
        mapRef.current.setPaintProperty(layerId, 'text-halo-color', '#ffffff');
        mapRef.current.setPaintProperty(layerId, 'text-halo-width', 1);
        console.log(`Configured: ${layerId}`);
      } catch (e) {
        console.log(`Failed to configure: ${layerId}`, e.message);
      }
    });
    
    allRoomLayers.forEach(layerId => {
      try {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
      } catch (e) {
        console.log(`Could not hide layer: ${layerId}`);
      }
    });
    
    setDebugInfo('Layers initialized');
    console.log('=============================');
  };

  const setupRoomInteractions = () => {
    console.log('=== SETTING UP ROOM INTERACTIONS ===');
    
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
              id: foundRoomData.location_numk || foundRoomData.location_id || foundRoomData.room_number || foundRoomData.room_id || 'Unknown',
              name: foundRoomData.location_name || foundRoomData.room_number || foundRoomData.name || `${wing} Room`,
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
        
        console.log('Interactions set up for:', layerId);
      } catch (error) {
        console.error('Error setting up interactions for layer:', layerId, error);
      }
    });
    
    console.log('========================================');
  };

  const showFloorOnly = (floor) => {
    console.log('=== SWITCHING TO FLOOR', floor, '===');
    setDebugInfo(`Switching to floor ${floor}...`);
    
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      console.log('Map not ready for floor switching, retrying...');
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
        console.log(`Hidden: ${layerId}`);
      } catch (e) {
        console.log(`Could not hide layer: ${layerId}`, e.message);
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
            console.log(`Showing: ${layerId}`);
            visibleCount++;
          } else {
            console.log(`Layer does not exist: ${layerId}`);
          }
        } catch (e) {
          console.log(`Failed to show: ${layerId}`, e.message);
        }
      });
      
      setDebugInfo(`Floor ${floor} - ${visibleCount}/6 layers visible (A & B Wings)`);
      console.log(`Floor ${floor}: ${visibleCount} layers made visible`);
      
      mapRef.current.triggerRepaint();
      
    }, 100);
    
    console.log('=================================');
  };

  const switchFloor = (floor) => {
    setCurrentFloor(floor);
    showFloorOnly(floor);
    setSelectedRoom(null);
    
    // Clear navigation when switching floors
    clearNavigation();
    
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
    
    console.log('🔧 Force hiding Level 3 labels...');
    level3LabelLayers.forEach(layerId => {
      try {
        mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
        console.log(`Force hidden: ${layerId}`);
      } catch (e) {
        console.log(`Could not force hide: ${layerId}`, e.message);
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
                    placeholder="e.g., 2A202, Classroom..."
                    value={startRoomInput}
                    onChange={(e) => {
                      setStartRoomInput(e.target.value);
                      searchRooms(e.target.value, true);
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
                    placeholder="e.g., 2A202, Classroom..."
                    value={endRoomInput}
                    onChange={(e) => {
                      setEndRoomInput(e.target.value);
                      searchRooms(e.target.value, false);
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
                  onClick={calculateNavigationRoute}
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
              {currentRoute && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small>
                    <strong>Route:</strong> {Math.round(currentRoute.distance)}m<br/>
                    <strong>Walking Time:</strong> ~{currentRoute.walkingTime} minutes
                  </small>
                </div>
              )}

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
    </div>
  );
};

export default Map;