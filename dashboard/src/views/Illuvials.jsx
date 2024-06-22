import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Grid } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import ProgressBar from '@ramonak/react-progress-bar';
import { lineData, options } from '../data/charts';

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

  console.log("Fetching data with params:", params);
  while (true) {
    try {
      const response = await axios.get(API_URL, { params });
      console.log("Received response with status:", response.status);
      if (response.status !== 200) {
        console.log("Failed to fetch data: HTTP Status Code", response.status);
        break;
      }

      const data = response.data;
      const activeOrders = data.result.filter(order => order.amount_sold === null);
      allOrders = [...allOrders, ...activeOrders];
      totalFetched += activeOrders.length;
      console.log("Total fetched: ", totalFetched);

      // Update estimated total if more data is fetched
      estimatedTotal = Math.max(estimatedTotal, totalFetched * 2); // Adjust estimation logic as needed

      // Calculate progress as a percentage
      progress = Math.min((totalFetched / estimatedTotal) * 100, 100);
      setProgress(progress);
      console.log(`Progress: ${progress}%`);

      const cursor = data.cursor;
      if (cursor) {
        params.cursor = cursor;
      } else {
        console.log("No more data to fetch, exiting loop.");
        break;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      break;
    }
  }

  return allOrders;
};

const processOrderData = (orders) => {
  console.log("Processing orders:", orders);
  const illuvialsData = orders.filter(order => order.sell && order.sell.data && order.sell.data.properties && order.sell.data.properties.collection && order.sell.data.properties.collection.name === 'Illuvium Illuvials');
  console.log("Filtered Illuvials data:", illuvialsData);

  const illuvialsCount = {};
  const illuvialsValue = {};
  const illuvialsPrice = {};

  illuvialsData.forEach(order => {
    const illuvialName = order.sell.data.properties.name;
    const quantity = parseFloat(order.buy.data.quantity) / 10 ** 18;
    const price = quantity * parseFloat(order.buy.data.price) / 10 ** 18;

    if (!illuvialsCount[illuvialName]) {
      illuvialsCount[illuvialName] = 0;
      illuvialsValue[illuvialName] = 0;
      illuvialsPrice[illuvialName] = { total: 0, count: 0 };
    }
    illuvialsCount[illuvialName] += 1;
    illuvialsValue[illuvialName] += price;
    illuvialsPrice[illuvialName].total += price;
    illuvialsPrice[illuvialName].count += 1;
  });

  const sortData = (data) => {
    const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);
    return {
      labels: sortedEntries.map(([label]) => label),
      values: sortedEntries.map(([, value]) => value),
    };
  };

  const sortedCountData = sortData(illuvialsCount);
  const sortedValueData = sortData(illuvialsValue);
  const sortedPriceData = sortData(
    Object.fromEntries(
      Object.entries(illuvialsPrice).map(([key, { total, count }]) => [key, total / count])
    )
  );

  const countData = {
    labels: sortedCountData.labels,
    datasets: [{
      data: sortedCountData.values,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ],
      borderWidth: 0, // Remove border between pie slices
    }]
  };

  const valueData = {
    labels: sortedValueData.labels,
    datasets: [{
      data: sortedValueData.values,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ],
      borderWidth: 0, // Remove border between pie slices
    }]
  };

  const averagePriceData = {
    labels: sortedPriceData.labels,
    datasets: [{
      data: sortedPriceData.values,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ],
      borderWidth: 0, // Remove border between pie slices
    }]
  };

  console.log("Prepared count data:", countData);
  console.log("Prepared value data:", valueData);
  console.log("Prepared average price data:", averagePriceData);

  return { countData, valueData, averagePriceData };
};

export default function Illuvials() {
  const [pieData, setPieData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting data fetch...");
      const orders = await fetchAllActiveOrders(setProgress);
      console.log("Fetched orders:", orders);
      const data = processOrderData(orders);
      setPieData(data);
      console.log("Set pie data:", data);
    };
    fetchData();
  }, []);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvials</Heading>
      <Text mb={5}>Information and trends about Illuvials on the platform.</Text>
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {pieData ? (
          <>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
              <Text fontSize="2xl">Illuvials Market Cap over Time</Text>
              <Line data={lineData} options={options} />
            </Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
              <Text fontSize="2xl">Total Amount of Illuvials for Sale Over Time</Text>
              <Line data={lineData} options={options} />
            </Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
              <Text fontSize="2xl">Change in Amount of Illuvials for Sale Over Time</Text>
              <Line data={lineData} options={options} />
            </Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 5">
              <Text fontSize="2xl">Distribution of Illuvials for Sale</Text>
              <Pie data={pieData.countData} options={options} />
            </Box>
            <Box gridColumn="span 2"></Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 5">
              <Text fontSize="2xl">Total Value of Illuvials for Sale</Text>
              <Pie data={pieData.valueData} options={options} />
            </Box>
            <Box gridColumn="span 1"></Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
              <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
              <Pie data={pieData.averagePriceData} options={options} />
            </Box>
          </>
        ) : (
          <Box gridColumn="span 3">
            <Text>Loading data...</Text>
            <ProgressBar completed={progress} />
          </Box>
        )}
      </Grid>
    </Box>
  );
};
