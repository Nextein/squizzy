import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Grid, VStack } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { lineData, samplePieData, options } from '../data/charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js/auto';

ChartJS.register(ChartDataLabels);


function sortData(data) {
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);
  return {
    labels: sortedEntries.map(([label]) => label),
    values: sortedEntries.map(([, value]) => value),
  };
};


const processOrderData = (orders) => {
  console.log("Received orders: ", orders);

  const illuvialsData = orders.filter(order =>
    order.sell &&
    order.sell.data &&
    order.sell.data.properties &&
    order.sell.data.properties.collection &&
    order.sell.data.properties.collection.name === 'Illuvium Illuvials'
  );

  console.log("Filtered Illuvials data: ", illuvialsData);

  const illuvialsCount = {};
  const illuvialsValue = {};
  const illuvialsPrice = {};

  illuvialsData.forEach(order => {
    const illuvialName = order.sell.data.properties.name;
    const quantity = parseFloat(order.buy.data.quantity_with_fees) / 10 ** 18;

    // Ensure proper parsing of float values
    if (isNaN(quantity)) {
      console.error(`Invalid quantity (${quantity}) for illuvial ${illuvialName}`);
      return;
    }

    if (!illuvialsCount[illuvialName]) {
      illuvialsCount[illuvialName] = 0;
      illuvialsValue[illuvialName] = 0;
      illuvialsPrice[illuvialName] = 0;
    }
    illuvialsCount[illuvialName] += 1;
    illuvialsValue[illuvialName] += quantity;

  });

  const sortedCountData = sortData(illuvialsCount);
  const sortedValueData = sortData(illuvialsValue);

  // Log the processed data to debug
  console.log("Sorted Count Data: ", sortedCountData);
  console.log("Sorted Value Data: ", sortedValueData);

  // Calculate average prices
  for (let i = 0; i < sortedCountData.labels.length; i++) {
    const illuvialName = sortedCountData.labels[i];
    console.log(i);
    console.log(illuvialName, illuvialsValue[illuvialName], illuvialsCount[illuvialName]);

    if (illuvialsValue[illuvialName] && illuvialsCount[illuvialName]) {
      illuvialsPrice[illuvialName] = illuvialsValue[illuvialName] / illuvialsCount[illuvialName];
    } else {
      illuvialsPrice[illuvialName] = 0;
    }
  }

  console.log('prices:', illuvialsPrice);
  const sortedAveragePriceData = sortData(illuvialsPrice);
  console.log('sorted prices:', sortedAveragePriceData);

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
    labels: sortedAveragePriceData.labels,
    datasets: [{
      data: sortedAveragePriceData.values,
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

  return { countData, valueData, averagePriceData };
};

const pieOptions = {
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      color: '#fff',
      formatter: (value, context) => {
        return context.chart.data.labels[context.dataIndex];
      },
      anchor: 'end',
      align: 'start',
      offset: 10,
      borderRadius: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 6,
    },
  },
};

export default function Illuvials({orders}) {
  const [pieData, setPieData] = useState(null);

  useEffect(() => {
    if (!orders) return;
    const data = processOrderData(orders);
    setPieData(data);
  }, [orders]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvials</Heading>
      <Text mb={5}>Information and trends about Illuvials on the platform.</Text>
      {pieData ? (
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
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
            <Pie data={pieData.countData} options={pieOptions} />
          </Box>
          <Box gridColumn="span 2"></Box>
          <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 5">
            <Text fontSize="2xl">Total Value of Illuvials for Sale</Text>
            <Pie data={pieData.valueData} options={pieOptions} />
          </Box>
          <Box gridColumn="span 3"></Box>
          <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
            <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
            <Pie data={pieData.averagePriceData} options={pieOptions} />
          </Box>
        </Grid>
      ) : (
        <VStack>
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
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
              <Pie data={samplePieData} options={pieOptions} />
            </Box>
            <Box gridColumn="span 2"></Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 5">
              <Text fontSize="2xl">Total Value of Illuvials for Sale</Text>
              <Pie data={samplePieData} options={pieOptions} />
            </Box>
            <Box gridColumn="span 3"></Box>
            <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
              <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
              <Pie data={samplePieData} options={pieOptions} />
            </Box>
          </Grid>
        </VStack>
      )}
    </Box>
  );
};
