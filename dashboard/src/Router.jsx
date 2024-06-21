import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Illuvials from './views/Illuvials';
import Illuvitars from './views/Illuvitars';
import Lands from './views/Lands';
import Wallets from './views/Wallets';
import Other from './views/Other';
import Baloth from './views/Baloth';
import Clan from './views/Clan';

function AppRouter() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
        <Route path="/illuvitars" element ={<Illuvitars />} />
        <Route path="/illuvials" element ={<Illuvials />} />
        <Route path="/lands" element ={<Lands />} />
        <Route path="/wallets" element ={<Wallets />} />
        <Route path="/baloth" element ={<Baloth />} />
        <Route path="/clan" element={<Clan />} />
        <Route path="/other" element ={<Other />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default AppRouter;
