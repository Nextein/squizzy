import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
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
}

const filterNonZeroEntries = (data) => {
  const filteredEntries = Object.entries(data).filter(([, value]) => value > 0);
  return {
    labels: filteredEntries.map(([label]) => label),
    values: filteredEntries.map(([, value]) => value),
  };
};

const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
};

const processOrderData = (illuvials) => {
  const illuvialsData = illuvials.filter(order =>
    order.sell &&
    order.sell.data &&
    order.sell.data.properties &&
    order.sell.data.properties.collection &&
    order.sell.data.properties.collection.name === 'Illuvium Illuvials'
  );

  const illuvialsCount = {};
  const illuvialsValue = {};
  const illuvialsAveragePrice = {};
  const illuvialsPrices = {};
  const illuvialsFloorPrice = {};
  const totalIlluvialsCount = {};

  illuvialsData.forEach(order => {
    const illuvialName = order.sell.data.properties.name;
    const quantity = parseFloat(order.buy.data.quantity_with_fees) / 10 ** 18;

    if (!totalIlluvialsCount[illuvialName]) {
      totalIlluvialsCount[illuvialName] = 0;
    }
    totalIlluvialsCount[illuvialName] += 1;

    if (isNaN(quantity) || quantity <= 0) return;

    if (!illuvialsCount[illuvialName]) {
      illuvialsCount[illuvialName] = 0;
      illuvialsValue[illuvialName] = 0;
      illuvialsAveragePrice[illuvialName] = 0;
      illuvialsPrices[illuvialName] = [];
      illuvialsFloorPrice[illuvialName] = quantity;
    }

    illuvialsCount[illuvialName] += 1;
    illuvialsValue[illuvialName] += quantity;
    illuvialsPrices[illuvialName].push(quantity);
    if (quantity < illuvialsFloorPrice[illuvialName]) {
      illuvialsFloorPrice[illuvialName] = quantity;
    }
  });

  Object.keys(illuvialsCount).forEach(illuvialName => {
    illuvialsAveragePrice[illuvialName] = illuvialsValue[illuvialName] / illuvialsCount[illuvialName];
    illuvialsPrices[illuvialName].sort((a, b) => a - b);
  });

  const illuvialsMedianPrice = {};
  const illuvialsPercentileBelowMedian = {};
  const illuvialsMedianDiscount = {};
  Object.keys(illuvialsPrices).forEach(illuvialName => {
    const median = calculateMedian(illuvialsPrices[illuvialName]);
    illuvialsMedianPrice[illuvialName] = median;
    const belowMedianPrices = illuvialsPrices[illuvialName].filter(price => price < median);
    illuvialsPercentileBelowMedian[illuvialName] = (belowMedianPrices.length / illuvialsPrices[illuvialName].length) * 100;
    illuvialsMedianDiscount[illuvialName] = belowMedianPrices.length > 0 ? calculateMedian(belowMedianPrices) : 0;
  });

  const sortedCountData = filterNonZeroEntries(illuvialsCount);
  const sortedValueData = filterNonZeroEntries(illuvialsValue);
  const sortedAveragePriceData = filterNonZeroEntries(illuvialsAveragePrice);
  const sortedMedianPriceData = filterNonZeroEntries(illuvialsMedianPrice);

  const countData = {
    labels: sortedCountData.labels,
    datasets: [
      {
        data: sortedCountData.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF'],
        borderWidth: 0,
      },
    ],
  };

  const valueData = {
    labels: sortedValueData.labels,
    datasets: [
      {
        data: sortedValueData.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF'],
        borderWidth: 0,
      },
    ],
  };

  const averagePriceData = {
    labels: sortedAveragePriceData.labels,
    datasets: [
      {
        data: sortedAveragePriceData.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF'],
        borderWidth: 0,
      },
    ],
  };

  const medianPriceData = {
    labels: sortedMedianPriceData.labels,
    datasets: [
      {
        data: sortedMedianPriceData.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF'],
        borderWidth: 0,
      },
    ],
  };

  return { countData, valueData, averagePriceData, medianPriceData, illuvialsPrices, illuvialsFloorPrice, illuvialsAveragePrice, illuvialsMedianPrice, totalIlluvialsCount, illuvialsPercentileBelowMedian, illuvialsMedianDiscount };
};

const pieOptions = {
  plugins: {
    legend: {
      display: true,
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

export default function Illuvials({ illuvials }) {
  const [countPieData, setCountPieData] = useState(null);
  const [valuePieData, setValuePieData] = useState(null);
  const [averagePricePieData, setAveragePricePieData] = useState(null);
  const [medianPricePieData, setMedianPricePieData] = useState(null);
  const [illuvialStats, setIlluvialStats] = useState([]);

  useEffect(() => {
    if (illuvials.length > 0) {
      const data = processOrderData(illuvials);
      setCountPieData(data.countData);
      setValuePieData(data.valueData);
      setAveragePricePieData(data.averagePriceData);
      setMedianPricePieData(data.medianPriceData);

      const stats = Object.keys(data.illuvialsPrices).map((illuvialName) => ({
        illuvialName,
        totalCount: data.totalIlluvialsCount[illuvialName],
        count: data.illuvialsPrices[illuvialName].length,
        floorPrice: data.illuvialsFloorPrice[illuvialName],
        averagePrice: data.illuvialsAveragePrice[illuvialName],
        medianPrice: data.illuvialsMedianPrice[illuvialName],
        percentileBelowMedian: data.illuvialsPercentileBelowMedian[illuvialName],
        medianDiscount: data.illuvialsMedianDiscount[illuvialName],
        floorDiscount: ((data.illuvialsMedianPrice[illuvialName] - data.illuvialsFloorPrice[illuvialName]) / data.illuvialsMedianPrice[illuvialName]) * 100,
      }));
      setIlluvialStats(stats);
    }
  }, [illuvials]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvials</Heading>
      <Text mb={5}>Information and trends about Illuvials on the platform.</Text>
      <Flex my={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md" overflow="auto" maxHeight="500px">
          <Text fontSize="2xl" mb={5}>Illuvial Statistics</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Illuvial Name</Th>
                <Th>Total</Th>
                <Th>For Sale</Th>
                <Th>Floor Price</Th>
                <Th>Median Price</Th>
                <Th>Median Discount</Th>
                <Th>Average Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {illuvialStats.map((stat) => (
                <Tr key={stat.illuvialName}>
                  <Td>{stat.illuvialName}</Td>
                  <Td>{stat.totalCount}</Td>
                  <Td>
                    {stat.count}
                    <Box as="span" color="gray.500" ml={2}>
                      ({((stat.count / stat.totalCount) * 100).toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>
                    {stat.floorPrice.toFixed(2)}
                    <Box as="span" color="gray.500" ml={2}>
                      ({((1 - stat.floorPrice / stat.medianPrice) * 100).toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>
                    {stat.medianPrice.toFixed(2)}
                    <Box as="span" color="gray.500" ml={2}>
                      ({stat.percentileBelowMedian.toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>
                    {stat.medianDiscount.toFixed(2)}
                    <Box as="span" color="gray.500" ml={2}>
                      ({((1 - stat.medianDiscount / stat.medianPrice) * 100).toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>{stat.averagePrice.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Flex>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Illuvials Market Cap over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Amount of Illuvials for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Change in Amount of Illuvials for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Illuvials for Sale</Text>
          <Pie data={countPieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Value of Illuvials for Sale</Text>
          <Pie data={valuePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Median Price for Sale of Illuvials</Text>
          <Pie data={medianPricePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
          <Pie data={averagePricePieData || samplePieData} options={pieOptions} />
        </Box>
      </SimpleGrid>
    </Box>
  );
}
