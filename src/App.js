import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap';
import MapView from './components/MapView';
import * as XLSX from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import geojsonData from './data/provincias.json'; // Asegúrate de proporcionar la ruta correcta a tu archivo GeoJSON

function App() {
  const [provincia, setProvincia] = useState('');
  const [ano, setAno] = useState('');
  const [valorRecaudado, setValorRecaudado] = useState('');
  const [inversionMinima, setInversionMinima] = useState('');
  const [inversionMaxima, setInversionMaxima] = useState('');
  const [riesgo, setRiesgo] = useState('');
  const [gananciaEstimada, setGananciaEstimada] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelo, setModelo] = useState('');
  const [prompt, setPrompt] = useState('');
  const [data, setData] = useState([]);

  const modelos = [
    'gpt-4o-mini', 'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106', 'gpt-4o-mini-2024-07-18'
  ];

  const provincias = [
    'AZUAY', 'BOLIVAR', 'CAÑAR', 'CARCHI', 'CHIMBORAZO', 'COTOPAXI', 'EL ORO', 'ESMERALDAS', 'GALAPAGOS', 'GUAYAS', 'IMBABURA', 'LOJA', 'LOS RIOS', 'MANABI', 'MORONA SANTIAGO', 'NAPO', 'ORELLANA', 'PASTAZA', 'PICHINCHA', 'SANTA ELENA', 'SANTO DOMINGO DE LOS TSACHILAS', 'SUCUMBIOS', 'TUNGURAHUA', 'ZAMORA CHINCHIPE'
  ];

  useEffect(() => {
    if (provincia && ano) {
      loadExcelData();
    }
  }, [provincia, ano, loadExcelData]);

  const loadExcelData = () => {
    fetch('/valores.xlsx')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el archivo Excel');
        }
        return response.arrayBuffer();
      })
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const range = XLSX.utils.decode_range(sheet['!ref']);
        const columnAData = [];
        for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
          const cellAddress = { c: 0, r: rowNum }; // Columna A es 0
          const cellRef = XLSX.utils.encode_cell(cellAddress);
          if (sheet[cellRef]) {
            columnAData.push(sheet[cellRef].v);
          }
        }

        const headers = columnAData[0].split(',');
        const jsonData = columnAData.slice(1).map(row => {
          const values = row.split(',');
          const entry = {};
          headers.forEach((header, index) => {
            entry[header] = values[index];
          });
          return entry;
        });

        console.log("Datos del Excel:", jsonData);
        const result = jsonData.find(item => item.PROVINCIA === provincia && parseInt(item.AÑO) === parseInt(ano));
        if (result) {
          setValorRecaudado(result.Prediccion_NN || 'No disponible');
          setInversionMinima(result.Inversion_Minima || 'No disponible');
          setInversionMaxima(result.Inversion_Maxima || 'No disponible');
          setRiesgo(result.Riesgo || 'No disponible');
          setGananciaEstimada(result.Ganancia_Estimada || 'No disponible');
        } else {
          setValorRecaudado('No disponible');
        }
      })
      .catch(error => {
        console.error('Error al procesar el archivo Excel:', error);
      });
  };

  const loadPlanInversionData = async () => {
    const response = await fetch('https://apimineria.azurewebsites.net/apiGeneraProyecto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model: modelo, ubicacion: provincia })
    });
    const proyecto = await response.json();
    setData(proyecto);
  };

  const handlePredict = () => {
    setLoading(true);
    loadPlanInversionData();
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
    }, 15000);
  };

  const isFormValid = provincia && ano && modelo && prompt;

  const renderListItems = (text) => {
    return text.split('\n').map((item, index) => (
      <li key={index}>{item}</li>
    ));
  };

  return (
    <Container>
      <h1 className="text-center">Sistema de Predicción de Recaudación</h1>
      <Row>
        <Col md={6}>
          <MapView provincia={provincia} geojsonData={geojsonData} />
        </Col>
        <Col md={6}>
          <Form>
            <Form.Group controlId="provincia">
              <Form.Label>Provincia</Form.Label>
              <Form.Control as="select" value={provincia} onChange={e => setProvincia(e.target.value)} className="custom-select">
                <option value="">Selecciona una provincia</option>
                {provincias.map((prov, index) => (
                  <option key={index} value={prov}>{prov}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="ano">
              <Form.Label>Año</Form.Label>
              <Form.Control as="select" value={ano} onChange={e => setAno(e.target.value)} className="custom-select">
                <option value="">Seleccione año</option>
                {[2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="modelo">
              <Form.Label>Modelo</Form.Label>
              <Form.Control as="select" value={modelo} onChange={e => setModelo(e.target.value)} className="custom-select">
                <option value="">Selecciona un modelo</option>
                {modelos.map((model, index) => (
                  <option key={index} value={model}>{model}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="prompt">
              <Form.Label>Idea del Proyecto</Form.Label>
              <Form.Control type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className='prompt' />
            </Form.Group>
            <br />
            <Button variant="primary" onClick={handlePredict} disabled={!isFormValid || loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Predecir Inversión'}
            </Button>
          </Form>
        </Col>
      </Row>
      <Modal show={showModal} size={"xl"} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ textAlign: 'center', width: '100%' }}>Predicción de Recaudación y Plan de Inversión</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <Row>
            <Col md={6}>
              <h5>Informe de Recaudación del {ano}</h5>
              <p><strong>Valor Recaudado:</strong> {"$" + valorRecaudado}</p>
              <p><strong>Inversión Mínima:</strong> {"$" + inversionMinima}</p>
              <p><strong>Inversión Máxima:</strong> {"$" + inversionMaxima}</p>
              <p><strong>Riesgo:</strong> {riesgo}</p>
              <p><strong>Ganancia Estimada:</strong> {"$" + gananciaEstimada}</p>
            </Col>
            <Col md={6}>
              <h5>Plan de Inversión</h5>
              <p><strong>Nombre del Proyecto:</strong> {data.nombreProyecto || 'No disponible'}</p>
              <p><strong>Descripcion:</strong> {data.descripcion || 'No disponible'}</p>
              <p><strong>Factibilidad:</strong> {data.evaluacionFactibilidad || 'No disponible'}</p>
              <p><strong>Competencia:</strong> 
                <ul>
                  {data.competencia ? renderListItems(data.competencia) : 'No disponible'}
                </ul>
              </p>
              <p><strong>Costos Estimados:</strong> 
                <ul>
                  {data.costosEstimados ? renderListItems(data.costosEstimados) : 'No disponible'}
                </ul>
              </p>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
