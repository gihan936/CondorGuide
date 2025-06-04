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
  const [debugInfo, setDebugInfo] = React.useState('Loading map...');

  const floorLayersRef = useRef({
    1: [],
    2: [],
    3: []
  });

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaGFkaW5pIiwiYSI6ImNtYjBxdnlzczAwNmUyanE0ejhqdnNibGMifQ.39lNqpWtEZ_flmjVch2V5g';
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kushadini/cmbhfuxoj001j01qt5att3psz',
      center: [-74.5, 40],
      zoom: 9
    });

    mapRef.current.on('load', () => {
      setDebugInfo('Map loaded successfully!');
      
      mapRef.current.flyTo({
        center: [-80.402, 43.391],
        zoom: 19,
        pitch: 45
      });
      
      setTimeout(() => findRooms(), 1000);
    });

    mapRef.current.on('error', (e) => {
      setDebugInfo('Map error occurred');
      console.error('Mapbox error:', e);
    });

    return () => mapRef.current?.remove();
  }, []);

  const findRooms = () => {
    setDebugInfo('Scanning for room layers...');
    
    const layers = mapRef.current.getStyle().layers;
    const foundLayers = [];
    
    floorLayersRef.current = { 1: [], 2: [], 3: [] };
    
    layers.forEach(layer => {
      const layerId = layer.id.toLowerCase();
      
      if (layerId.includes('wing') || 
          layerId.includes('room') || 
          layerId.includes('level') ||
          layerId.includes('a-wing')) {
        
        foundLayers.push(layer);
        
        if (layerId.includes('level-1') || layerId.includes('1')) {
          floorLayersRef.current[1].push(layer.id);
        } else if (layerId.includes('level-3') || layerId.includes('3')) {
          floorLayersRef.current[3].push(layer.id);
        } else {
          floorLayersRef.current[2].push(layer.id);
        }
      }
    });
    
    setRoomLayers(foundLayers);
    
    if (foundLayers.length === 0) {
      setDebugInfo('No room layers found');
    } else {
      setDebugInfo(`Found ${foundLayers.length} room layers!`);
      setupInteractions(foundLayers);
      showFloorOnly(currentFloor);
    }
  };

  const setupInteractions = (layers) => {
    layers.forEach(layer => {
      const layerId = layer.id;
      
      if (layer.type === 'fill' || layer.type === 'fill-extrusion') {
        mapRef.current.on('click', layerId, (e) => {
          if (e.features.length > 0) {
            const roomData = e.features[0].properties;
            
            console.log('Available room properties:', roomData);
            console.log('Property keys:', Object.keys(roomData));
            
            setSelectedRoom({
              id: roomData.room_number || roomData.location_id || roomData.room_id || 'Unknown',
              name: roomData.location_name || roomData.room_number || roomData.room_id || 'Unknown',
              floor: currentFloor,
              type: roomData.location_type || roomData.room_type || 'Classroom',
              status: roomData.status || 'Available',
              equipment: roomData.equipment || 'Standard classroom equipment',
              description: roomData.description || 'No description available'
            });
          }
        });
        
        mapRef.current.on('mouseenter', layerId, () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });
        
        mapRef.current.on('mouseleave', layerId, () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
      }
    });
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
      center: [-80.402, 43.391],
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
        
        {/* Floor Switcher - Only floating element */}
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

        {/* Map Controls - Floating */}
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

      {/* Information Panel Below Map */}
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
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Room Layers:</span>
                    <Badge bg="success">{roomLayers.length}</Badge>
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
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Room Information</h5>
                  <Button 
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedRoom(null)}
                  >
                    Close
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h4 className="text-primary">{selectedRoom.name}</h4>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Room Number:</strong></td>
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