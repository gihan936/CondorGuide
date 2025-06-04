import React, { useEffect, useRef, useContext } from 'react';
import { Card, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { ThemeContext } from '../context/ThemeContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = () => {
  const { theme } = useContext(ThemeContext);
  const mapContainerRef = useRef();
  const mapRef = useRef();
  
  const [currentFloor, setCurrentFloor] = React.useState(2);
  const [roomLayers, setRoomLayers] = React.useState([]);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [is3D, setIs3D] = React.useState(true);
  const [roomData, setRoomData] = React.useState({});
  const [debugInfo, setDebugInfo] = React.useState('Loading map...');
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [isDataReady, setIsDataReady] = React.useState(false);

  const floorLayersRef = useRef({
    1: [],
    2: [],
    3: []
  });

  // Helper function to generate multiple coordinate keys with different precisions
  const generateCoordinateKeys = (lng, lat) => {
    return [
      `${lng.toFixed(6)},${lat.toFixed(6)}`,  // High precision
      `${lng.toFixed(5)},${lat.toFixed(5)}`,  // Medium-high precision
      `${lng.toFixed(4)},${lat.toFixed(4)}`,  // Medium precision
      `${lng.toFixed(3)},${lat.toFixed(3)}`,  // Lower precision (like old center)
      `${lng.toFixed(2)},${lat.toFixed(2)}`   // Very low precision
    ];
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

  // Fetch room data from datasets API
  const fetchRoomData = async () => {
    try {
      setDebugInfo('Fetching room data from dataset...');
      
      const datasetIds = [
        'cmbhf0ndq2kld1on5g332amn7',
        'cmbfb8tar52id1ump75xqao9r', 
        'cmbhf2g8t36tf1pna7q2ed3bu'
      ];
      
      const allRoomData = {};
      
      for (const datasetId of datasetIds) {
        try {
          const response = await fetch(`https://api.mapbox.com/datasets/v1/kushadini/${datasetId}/features?access_token=${mapboxgl.accessToken}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`Dataset ${datasetId} data:`, data);
            
            // Store room data by coordinates for lookup
            data.features.forEach(feature => {
              if (feature.geometry && feature.geometry.coordinates && feature.properties) {
                // Create a key based on the center point of the room
                const coords = feature.geometry.coordinates[0];
                if (coords && coords.length > 0) {
                  // Calculate center point
                  let centerLng = 0, centerLat = 0;
                  coords.forEach(coord => {
                    centerLng += coord[0];
                    centerLat += coord[1];
                  });
                  centerLng /= coords.length;
                  centerLat /= coords.length;
                  
                  // Generate multiple precision keys for this room
                  const keys = generateCoordinateKeys(centerLng, centerLat);
                  
                  // Store the room data under all precision levels
                  keys.forEach(key => {
                    allRoomData[key] = feature.properties;
                  });
                }
              }
            });
          }
        } catch (err) {
          console.log(`Could not fetch dataset ${datasetId}:`, err);
        }
      }
      
      setRoomData(allRoomData);
      console.log('=== ROOM DATA LOADED ===');
      console.log('Total room entries:', Object.keys(allRoomData).length);
      console.log('Sample room data keys:', Object.keys(allRoomData).slice(0, 10));
      console.log('Sample room data values:', Object.values(allRoomData).slice(0, 2));
      console.log('========================');
      setDebugInfo(`Room data loaded: ${Object.keys(allRoomData).length} entries`);
      setIsDataReady(true);
      
    } catch (error) {
      console.error('Error fetching room data:', error);
      setDebugInfo('Error loading room data');
      setIsDataReady(true); // Set to true even on error so the map can continue
    }
  };

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaGFkaW5pIiwiYSI6ImNtYjBxdnlzczAwNmUyanE0ejhqdnNibGMifQ.39lNqpWtEZ_flmjVch2V5g';
    
    // Start fetching room data immediately
    fetchRoomData();
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kushadini/cmbhfuxoj001j01qt5att3psz',
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
      
      // Add global click handler for debugging
      mapRef.current.on('click', (e) => {
        const features = mapRef.current.queryRenderedFeatures(e.point);
        console.log('=== GLOBAL CLICK DEBUG ===');
        console.log('Click coordinates:', e.lngLat);
        console.log('Features at click point:', features);
        console.log('Feature layer IDs:', features.filter(f => f && f.layer && f.layer.id).map(f => f.layer.id));
        console.log('==========================');
      });
      
      setIsMapReady(true);
    });

    mapRef.current.on('error', (e) => {
      setDebugInfo('Map error occurred');
      console.error('Mapbox error:', e);
    });

    return () => mapRef.current?.remove();
  }, []);

  // Set up room interactions when both map and data are ready
  useEffect(() => {
    if (isMapReady && isDataReady) {
      console.log('Both map and data ready, setting up room interactions...');
      setTimeout(() => findRooms(), 1000);
    }
  }, [isMapReady, isDataReady]);

  const findRooms = () => {
    setDebugInfo('Scanning for room layers...');
    
    // Check if map and style are ready
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
      console.log('Map or style not ready, retrying in 1 second...');
      setTimeout(() => findRooms(), 1000);
      return;
    }
    
    try {
      const style = mapRef.current.getStyle();
      if (!style || !style.layers) {
        console.log('Style or layers not available, retrying...');
        setTimeout(() => findRooms(), 1000);
        return;
      }
      
      const layers = style.layers;
      const foundLayers = [];
      
      //Debugging for layer detection
      console.log('=== LAYER DETECTION DEBUG ===');
      console.log('Total layers found:', layers.length);
      console.log('All layer IDs:', layers.filter(l => l && l.id).map(l => l.id));
      console.log('================================');
      
      floorLayersRef.current = { 1: [], 2: [], 3: [] };
      
      layers.forEach(layer => {
        // Check if layer exists and has an id
        if (!layer || !layer.id) {
          console.log('Skipping invalid layer:', layer);
          return;
        }
        
        const layerId = layer.id.toLowerCase();
        
        // Matching layer names
        if (layerId.includes('a-wing-level') || 
            layerId.includes('wing') || 
            layerId.includes('room') || 
            layerId.includes('level')) {
          
          foundLayers.push(layer);
          console.log('Found potential room layer:', layer.id, 'Type:', layer.type);
          
          // Categorize by floor based on naming pattern
          if (layerId.includes('a-wing-level-1')) {
            floorLayersRef.current[1].push(layer.id);
          } else if (layerId.includes('a-wing-level-3')) {
            floorLayersRef.current[3].push(layer.id);
          } else if (layerId.includes('a-wing-level-2')) {
            floorLayersRef.current[2].push(layer.id);
          }
        }
      });
      
      console.log('Final floor categorization:', floorLayersRef.current);
      
      setRoomLayers(foundLayers);
      
      if (foundLayers.length === 0) {
        setDebugInfo('No room layers found - check layer names');
        console.log('No room layers detected. Try looking for layers with these patterns:');
        console.log('- Layers containing "wing", "room", "level", "floor", or "building"');
      } else {
        setDebugInfo(`Found ${foundLayers.length} room layers!`);
        setupInteractions(foundLayers);
        showFloorOnly(currentFloor);
      }
    } catch (error) {
      console.error('Error in findRooms:', error);
      setDebugInfo('Error finding room layers');
      // Retry after a delay
      setTimeout(() => findRooms(), 2000);
    }
  };

  const setupInteractions = (layers) => {
    if (!layers || layers.length === 0) {
      console.log('No layers provided to setupInteractions');
      return;
    }
    
    console.log('Setting up interactions with room data entries:', Object.keys(roomData).length);
    
    layers.forEach(layer => {
      if (!layer || !layer.id) {
        console.log('Invalid layer object:', layer);
        return;
      }
      
      const layerId = layer.id;
      
      // Target fill and fill-extrusion layers (clickable room areas)
      if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
        console.log('Setting up interactions for layer:', layerId, 'Type:', layer.type);
        
        try {
          // Remove existing listeners to avoid duplicates
          mapRef.current.off('click', layerId);
          mapRef.current.off('mouseenter', layerId);
          mapRef.current.off('mouseleave', layerId);
          
          mapRef.current.on('click', layerId, (e) => {
            if (e.features.length > 0) {
              const feature = e.features[0];
              const geometry = feature.geometry;
              
              // Calculate center point of the clicked room
              let foundRoomData = {};
              let matchedKey = null;
              
              if (geometry && geometry.coordinates && geometry.coordinates[0]) {
                const coords = geometry.coordinates[0];
                let centerLng = 0, centerLat = 0;
                coords.forEach(coord => {
                  centerLng += coord[0];
                  centerLat += coord[1];
                });
                centerLng /= coords.length;
                centerLat /= coords.length;
                
                // Use the improved room data finder with current roomData
                const result = findRoomData(centerLng, centerLat, roomData);
                foundRoomData = result.data;
                matchedKey = result.matchedKey;
                
                console.log('=== ROOM CLICK DEBUG ===');
                console.log('Clicked layer:', layerId);
                console.log('Room center coordinates:', centerLng, centerLat);
                console.log('Tried coordinate keys:', generateCoordinateKeys(centerLng, centerLat));
                console.log('Matched key:', matchedKey);
                console.log('Found room data:', foundRoomData);
                console.log('Available room data keys:', Object.keys(foundRoomData));
                console.log('Total roomData entries:', Object.keys(roomData).length);
                console.log('========================');
              }
              
              setSelectedRoom({
                id: foundRoomData.room_number || foundRoomData.location_id || foundRoomData.room_id || 'Unknown',
                name: foundRoomData.location_name || foundRoomData.room_number || foundRoomData.name || 'Unknown',
                floor: currentFloor,
                type: foundRoomData.location_type || foundRoomData.room_type || foundRoomData.type || 'Classroom',
                status: foundRoomData.status || 'Available', 
                equipment: foundRoomData.equipment || 'Standard classroom equipment',
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
          console.error('Error setting up interactions for layer:', layerId, error);
        }
      }
    });
    
    const interactiveLayers = layers.filter(l => l.type === 'fill' || l.type === 'fill-extrusion');
    console.log('Interactions set up for layers:', interactiveLayers.map(l => l.id));
  };

  const showFloorOnly = (floor) => {
    Object.keys(floorLayersRef.current).forEach(floorNum => {
      floorLayersRef.current[floorNum].forEach(layerId => {
        try {
          mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
        } catch (e) {
          console.log(`Could not hide layer: ${layerId}`);
        }
      });
    });
    
    if (floorLayersRef.current[floor] && floorLayersRef.current[floor].length > 0) {
      floorLayersRef.current[floor].forEach(layerId => {
        try {
          mapRef.current.setLayoutProperty(layerId, 'visibility', 'visible');
        } catch (e) {
          console.log(`Could not show layer: ${layerId}`);
        }
      });
      setDebugInfo(`Showing floor ${floor}`);
    }
  };

  const switchFloor = (floor) => {
    setCurrentFloor(floor);
    showFloorOnly(floor);
    setSelectedRoom(null);
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
        />
        
        {/* Floor Switcher */}
        <div className="floor-switcher position-absolute">
          <Card className={`shadow ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
            <Card.Body className="text-center p-3">
              <h6 className="mb-3">Floor</h6>
              {[3, 2, 1].map(floor => (
                <Button
                  key={floor}
                  variant={currentFloor === floor ? "primary" : "outline-secondary"}
                  className="d-block w-100 mb-2"
                  style={{ minWidth: '50px', minHeight: '50px' }}
                  onClick={() => switchFloor(floor)}
                >
                  {floor}
                </Button>
              ))}
            </Card.Body>
          </Card>
        </div>

        {/* Map Controls */}
        <div className="map-controls position-absolute">
          <div className="d-flex flex-column gap-2">
            <Button variant="warning" onClick={toggle3D}>
              Toggle 3D
            </Button>
            <Button variant="secondary" onClick={resetView}>
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* Information Panel Below*/}
      <Container fluid className="py-4">
        <Row>
          {/* Building Info */}
          <Col lg={4}>
            <Card className={`h-100 shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
              <Card.Body>
                <Card.Title className="h4">
                  Conestoga College
                </Card.Title>
                <Card.Subtitle className="mb-3 text-muted">
                  A Wing Interactive Map
                </Card.Subtitle>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Current Floor:</span>
                    <Badge bg="primary">Level {currentFloor}</Badge>
                  </div>
                  
                </div>

                <hr />
                
                <h6>Instructions</h6>
                <ul className="small mb-0">
                  <li>Click any room on the map for details</li>
                  <li>Use floor buttons to switch levels</li>
                  <li>Toggle 3D view for better perspective</li>
                  <li>Room information appears below</li>
                </ul>

                <div className="mt-3">
                  <small className={`d-block p-2 rounded ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`}>
                    <strong>Status:</strong> {debugInfo}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Selected Room Info */}
          <Col lg={8}>
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
                            <td><Badge bg="primary">{selectedRoom.id}</Badge></td>
                          </tr>
                          <tr>
                            <td><strong>Floor:</strong></td>
                            <td><Badge bg="info">Level {selectedRoom.floor}</Badge></td>
                          </tr>
                          <tr>
                            <td><strong>Type:</strong></td>
                            <td><Badge bg="warning">{selectedRoom.type}</Badge></td>
                          </tr>
                          <tr>
                            <td><strong>Status:</strong></td>
                            <td><Badge bg="success">{selectedRoom.status}</Badge></td>
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
                      
                      <div className="mt-3">
                        <Button variant="outline-primary" size="sm" className="me-2">
                          Book Room
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          Report Issue
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ) : (
              <Card className={`shadow-sm text-center ${theme === 'dark' ? 'bg-dark text-light' : 'bg-white'}`}>
                <Card.Body className="py-5">
                  <h5 className="text-muted">No Room Selected</h5>
                  <p className="text-muted">Click on any room in the map above to view detailed information.</p>
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