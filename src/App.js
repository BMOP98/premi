import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Inicio';

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </>
);


export default App;
