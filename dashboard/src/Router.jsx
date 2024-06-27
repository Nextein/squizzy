import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Illuvials from './views/Illuvials';
import Illuvitars from './views/Illuvitars';
import Lands from './views/Lands';
import ProgressBar from '@ramonak/react-progress-bar';
import Wallets from './views/Wallets';
import Other from './views/Other';
import Baloth from './views/Baloth';
import Clan from './views/Clan';
import { Box, Button, Center, Flex, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';

const ORDERS_API_URL = "https://api.sandbox.x.immutable.com/v3/orders";
const LANDS_API_URL = "https://api.x.immutable.com/v1/assets";
const LANDS_TOTAL = 20000;
const PAGE_SIZE = 200;

async function fetchAllActiveOrders(setProgress) {
  let allOrders = [];
  let params = {
    status: "active",
    page_size: PAGE_SIZE
  };
  let totalFetched = 0;
  let progress = 0;
  let estimatedTotal = 1000; // Initial estimate for total records, adjust as needed
  let db = 0; 
  let debug_break = 30; // 0 for no debugging

  while (true) {
    try {
      const response = await axios.get(ORDERS_API_URL, { params });
      if (response.status !== 200) break;

      const data = response.data;
      const activeOrders = data.result.filter(order => order.amount_sold === null);
      allOrders = [...allOrders, ...activeOrders];
      totalFetched += activeOrders.length;

      // Update estimated total if more data is fetched
      estimatedTotal = Math.max(estimatedTotal, totalFetched * 2); // Adjust estimation logic as needed

      // Calculate progress as a percentage
      progress = Math.min((totalFetched / (estimatedTotal + LANDS_TOTAL)) * 100, 100);
      setProgress(progress);

      db += 1;
      const cursor = data.cursor;
      if (cursor && db < debug_break) {
        params.cursor = cursor;
      } else {
        break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      break;
    }
  }

  return allOrders;
};

async function fetchAllLandsData(setProgress) {
  let allLands = [];
  let params = {
    collection: "0x9e0d99b864e1ac12565125c5a82b59adea5a09cd",
    sell_orders: true,
    page_size: PAGE_SIZE
  };
  let totalFetched = 0;
  let progress = 0;

  while (true) {
    try {
      const response = await axios.get(LANDS_API_URL, { params });
      if (response.status !== 200) break;

      const data = response.data;
      const lands = data.result;
      allLands = [...allLands, ...lands];
      totalFetched += lands.length;

      // Calculate progress as a percentage
      progress = Math.min((totalFetched / LANDS_TOTAL) * 100, 100);
      setProgress(progress);

      const cursor = data.cursor;
      if (cursor) {
        params.cursor = cursor;
      } else {
        break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      break;
    }
  }

  return allLands;
};

function AppRouter() {
  const [rootData, setRootData] = useState({orders: [], lands: []});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [orders, lands] = await Promise.all([
      fetchAllActiveOrders(setProgress),
      fetchAllLandsData(setProgress)
    ]);
    setRootData({ orders, lands });
    setLoading(false);
  }

  return (
    <>
      {rootData.orders.length>0 && rootData.lands.length>0 ?
        null
        :
        <Flex mt={8}>
          {loading ?
            <Box ml={4}>
              <Text>Loading data...</Text>
              <Center my={2}>
                <Spinner />
              </Center>
              <ProgressBar completed={progress} />
            </Box>
            :
            <Button onClick={fetchData} bg={'purple.100'}>Load<br />Data</Button>
          }
        </Flex>
      }
      <Routes>
        <Route path="/home" element={<Home data={rootData} />} />
        <Route path="/illuvitars" element={<Illuvitars data={rootData} />} />
        <Route path="/illuvials" element={<Illuvials orders={rootData.orders} />} />
        <Route path="/lands" element={<Lands lands={rootData.lands} />} />
        <Route path="/wallets" element={<Wallets data={rootData} />} />
        <Route path="/baloth" element={<Baloth data={rootData} />} />
        <Route path="/clan" element={<Clan data={rootData} />} />
        <Route path="/other" element={<Other data={rootData} />} />
        <Route path="*" element={<Home data={rootData} />} />
      </Routes>
    </>
  );
}

export default AppRouter;
