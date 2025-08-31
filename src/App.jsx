import React from 'react';
import Register from './components/Register';
import Home from './components/Home';
import { Route, Routes , Navigate} from 'react-router-dom';
import Success from './components/Success';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path='/successfull' element = {<Success/>}/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
