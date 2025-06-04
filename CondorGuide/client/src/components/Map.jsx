import React, { useEffect, useRef, useContext } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
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
  const [showRoomInfo, setShowRoomInfo] = React.useState(false);

  const floorLayersRef = useRef({
    1: [],
    2: [],
    3: []
  });

  useEffect(() => {
    //Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoia3VzaGFkaW5pIiwiYSI6ImNtYjBxdnlzczAwNmUyanE0ejhqdnNibGMifQ.39lNqpWtEZ_flmjVch2V5g';
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kushadini/cmbhfuxoj001j01qt5att3psz',
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9 // starting zoom
    });

    mapRef.current.on('load', () => {
      setDebugInfo('Map loaded successfully!');
      
      // Fly to your college location once loaded
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
    
    // Reset floor layers
    floorLayersRef.current = { 1: [], 2: [], 3: [] };
    
    layers.forEach(layer => {
      const layerId = layer.id.toLowerCase();
      
      if (layerId.includes('wing') || 
          layerId.includes('room') || 
          layerId.includes('level') ||
          layerId.includes('a-wing')) {
        
        foundLayers.push(layer);
        
        // Categorize by floor
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
            setSelectedRoom({
              id: roomData.location_number || roomData.location_id || 'Unknown',
              name: roomData.location_name || roomData.location_number || 'Unknown',
              floor: currentFloor,
              type: roomData.location_type || 'Classroom',
              status: roomData.status || 'Available',
              equipment: roomData.equipment || 'Standard classroom equipment',
              description: roomData.description || 'No description available'
            });
            setShowRoomInfo(true);
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
    // Hide all floor layers
    Object.keys(floorLayersRef.current).forEach(floorNum => {
      floorLayersRef.current[floorNum].forEach(layerId => {
        try {
          mapRef.current.setLayoutProperty(layerId, 'visibility', 'none');
        } catch (e) {
          console.log(`Could not hide layer: ${layerId}`);
        }
      });
    });
    
    // Show selected floor layers
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
    setShowRoomInfo(false);
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
    setShowRoomInfo(false);
  };

  return (
    <div className="map-page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Map Container*/}
      <div 
        ref={mapContainerRef}
        style={{ height: '100vh' }}
        className="map-container"
      />

      {/* Info Card */}
      <Card 
        className="position-absolute shadow-lg"
        style={{ 
          top: '15px', 
          left: '15px', 
          width: '300px',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000
        }}
      >
        <Card.Body>
          <Card.Title className={`h4 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
            Conestoga College
          </Card.Title>
          <Card.Subtitle className={`mb-3 ${theme === 'dark' ? 'text-light' : 'text-muted'}`}>
            A Wing Interactive Map
          </Card.Subtitle>
          
          <div className="d-flex justify-content-between mb-2">
            <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Current Floor:</span>
            <Badge bg="primary">Level {currentFloor}</Badge>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Room Layers:</span>
            <Badge bg="success">{roomLayers.length}</Badge>
          </div>

          <hr />
          
          <h6 className={theme === 'dark' ? 'text-white' : 'text-dark'}>Instructions</h6>
          <small className={theme === 'dark' ? 'text-light' : 'text-muted'}>
            Click any room for details<br/>
            Use floor buttons to switch levels<br/>
            Toggle 3D view for better perspective
          </small>

          <div className="mt-3">
            <small className={`d-block p-2 rounded ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
              {debugInfo}
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Floor Switcher */}
      <Card
        className="position-absolute shadow-lg"
        style={{
          top: '50%',
          right: '15px',
          transform: 'translateY(-50%)',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000
        }}
      >
        <Card.Body className="text-center p-3">
          <h6 className={theme === 'dark' ? 'text-white' : 'text-dark'}>Floor</h6>
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

      {/* Controls */}
      <div 
        className="position-absolute"
        style={{ bottom: '15px', right: '15px', zIndex: 1000 }}
      >
        <div className="d-flex flex-column gap-2">
          <Button variant="warning" onClick={toggle3D}>
            Toggle 3D
          </Button>
          <Button variant="secondary" onClick={resetView}>
            Reset View
          </Button>
        </div>
      </div>

      {/* Room Info Modal */}
      {showRoomInfo && selectedRoom && (
        <Card
          className="position-absolute shadow-lg"
          style={{
            bottom: '15px',
            left: '15px',
            width: '300px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            borderLeft: '4px solid #007bff'
          }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className={`h5 ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
                {selectedRoom.name}
              </Card.Title>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowRoomInfo(false)}
                className="p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Room Number:</span>
              <Badge bg="primary">{selectedRoom.id}</Badge>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Floor:</span>
              <Badge bg="info">Level {selectedRoom.floor}</Badge>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Type:</span>
              <Badge bg="warning">{selectedRoom.type}</Badge>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Status:</span>
              <Badge bg="success">{selectedRoom.status}</Badge>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className={theme === 'dark' ? 'text-light' : 'text-dark'}>Equipment:</span>
              <span className={`${theme === 'dark' ? 'text-light' : 'text-dark'} text-end`} style={{fontSize: '0.9em', maxWidth: '60%'}}>
                {selectedRoom.equipment}
              </span>
            </div>
            
            {selectedRoom.description && selectedRoom.description !== 'No description available' && (
              <div className="mt-3">
                <small className={theme === 'dark' ? 'text-light' : 'text-muted'}>
                  <strong>Description:</strong> {selectedRoom.description}
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Map;