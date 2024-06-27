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
const API_URL = "https://api.sandbox.x.immutable.com/v3/orders";

async function fetchAllActiveOrders(setProgress) {
  let allOrders = [];
  let params = {
    status: "active",
    page_size: 200
  };
  let totalFetched = 0;
  let progress = 0;
  let estimatedTotal = 1000; // Initial estimate for total records, adjust as needed
  let db = 0; let debug_break = 30; // 0 for no debugging

  while (true) {
    try {
      const response = await axios.get(API_URL, { params });
      if (response.status !== 200) break;

      const data = response.data;
      const activeOrders = data.result.filter(order => order.amount_sold === null);
      allOrders = [...allOrders, ...activeOrders];
      totalFetched += activeOrders.length;

      // Update estimated total if more data is fetched
      estimatedTotal = Math.max(estimatedTotal, totalFetched * 2); // Adjust estimation logic as needed

      // Calculate progress as a percentage
      progress = Math.min((totalFetched / estimatedTotal) * 100, 100);
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

function AppRouter() {
  const [rootData, setRootData] = useState();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const orders = await fetchAllActiveOrders(setProgress);
    setRootData(orders);
    setLoading(false);
  }

  return (
    <>
      {rootData ?
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
            <Button onClick={fetchData} bg={'purple.100'}>load<br />data</Button>
          }
        </Flex>
      }
      <Routes>
        <Route path="/home" element={<Home orders={rootData} />} />
        <Route path="/illuvitars" element={<Illuvitars orders={rootData} />} />
        <Route path="/illuvials" element={<Illuvials orders={rootData} />} />
        <Route path="/lands" element={<Lands orders={rootData} />} />
        <Route path="/wallets" element={<Wallets orders={rootData} />} />
        <Route path="/baloth" element={<Baloth orders={rootData} />} />
        <Route path="/clan" element={<Clan orders={rootData} />} />
        <Route path="/other" element={<Other orders={rootData} />} />
        <Route path="*" element={<Home orders={rootData} />} />
      </Routes>
    </>
  );
}

export default AppRouter;
