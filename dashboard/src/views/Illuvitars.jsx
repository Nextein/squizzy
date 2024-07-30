import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Table, Thead, Tbody, Tr, Th, Td, Grid, Button, HStack } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { lineData, samplePieData, options } from '../data/charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js/auto';

ChartJS.register(ChartDataLabels);

const generateColor = () => {
  const r = Math.floor((Math.random() * 127) + 127);
  const g = Math.floor((Math.random() * 127) + 127);
  const b = Math.floor((Math.random() * 127) + 127);
  return `rgb(${r}, ${g}, ${b})`;
};

const getColor = (name, colorMapping) => {
  if (!colorMapping[name]) {
    colorMapping[name] = generateColor();
  }
  return colorMapping[name];
};

const filterNonZeroEntries = (data) => {
  const filteredEntries = Object.entries(data).filter(([, value]) => value > 0);
  const sortedEntries = filteredEntries.sort(([, a], [, b]) => b - a); // Sorting by value in descending order
  return {
    labels: sortedEntries.map(([label]) => label),
    values: sortedEntries.map(([, value]) => value),
  };
};

const removeBottomPercentile = (data, percentile = 80) => {
  const thresholdIndex = Math.floor(data.values.length * (percentile / 100));
  return {
    labels: data.labels.slice(0, -thresholdIndex),
    values: data.values.slice(0, -thresholdIndex),
  };
};

const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
};

const processOrderData = (illuvitars, colorMapping) => {
  const illuvitarsData = illuvitars.filter(order =>
    order.sell &&
    order.sell.data &&
    order.sell.data.properties &&
    order.sell.data.properties.collection &&
    order.sell.data.properties.collection.name === 'Illuvitars' &&
    order.buy.data.quantity_with_fees > 0
  );

  const illuvitarsCount = {};
  const illuvitarsValue = {};
  const illuvitarsAveragePrice = {};
  const illuvitarsPrices = {};
  const illuvitarsFloorPrice = {};
  const totalIlluvitarsCount = {};

  illuvitarsData.forEach(order => {
    const illuvitarName = order.sell.data.properties.name;
    const quantity = parseFloat(order.buy.data.quantity_with_fees) / 10 ** 18;

    if (!totalIlluvitarsCount[illuvitarName]) {
      totalIlluvitarsCount[illuvitarName] = 0;
    }
    totalIlluvitarsCount[illuvitarName] += 1;

    if (isNaN(quantity) || quantity <= 0) return;

    if (!illuvitarsCount[illuvitarName]) {
      illuvitarsCount[illuvitarName] = 0;
      illuvitarsValue[illuvitarName] = 0;
      illuvitarsAveragePrice[illuvitarName] = 0;
      illuvitarsPrices[illuvitarName] = [];
      illuvitarsFloorPrice[illuvitarName] = quantity;
    }

    illuvitarsCount[illuvitarName] += 1;
    illuvitarsValue[illuvitarName] += quantity;
    illuvitarsPrices[illuvitarName].push(quantity);
    if (quantity < illuvitarsFloorPrice[illuvitarName]) {
      illuvitarsFloorPrice[illuvitarName] = quantity;
    }
  });

  Object.keys(illuvitarsCount).forEach(illuvitarName => {
    illuvitarsAveragePrice[illuvitarName] = illuvitarsValue[illuvitarName] / illuvitarsCount[illuvitarName];
    illuvitarsPrices[illuvitarName].sort((a, b) => a - b);
  });

  const illuvitarsMedianPrice = {};
  const illuvitarsPercentileBelowMedian = {};
  const illuvitarsMedianDiscount = {};
  Object.keys(illuvitarsPrices).forEach(illuvitarName => {
    const median = calculateMedian(illuvitarsPrices[illuvitarName]);
    illuvitarsMedianPrice[illuvitarName] = median;
    const belowMedianPrices = illuvitarsPrices[illuvitarName].filter(price => price < median);
    illuvitarsPercentileBelowMedian[illuvitarName] = (belowMedianPrices.length / illuvitarsPrices[illuvitarName].length) * 100;
    illuvitarsMedianDiscount[illuvitarName] = belowMedianPrices.length > 0 ? calculateMedian(belowMedianPrices) : 0;
  });

  const sortedCountData = filterNonZeroEntries(illuvitarsCount);
  const sortedValueData = filterNonZeroEntries(illuvitarsValue);
  const sortedAveragePriceData = filterNonZeroEntries(illuvitarsAveragePrice);
  const sortedMedianPriceData = filterNonZeroEntries(illuvitarsMedianPrice);

  const filteredCountData = removeBottomPercentile(sortedCountData);
  const filteredValueData = removeBottomPercentile(sortedValueData);
  const filteredAveragePriceData = removeBottomPercentile(sortedAveragePriceData);
  const filteredMedianPriceData = removeBottomPercentile(sortedMedianPriceData);

  const countData = {
    labels: filteredCountData.labels,
    datasets: [
      {
        data: filteredCountData.values,
        backgroundColor: filteredCountData.labels.map(label => getColor(label, colorMapping)),
        borderWidth: 0,
      },
    ],
  };

  const valueData = {
    labels: filteredValueData.labels,
    datasets: [
      {
        data: filteredValueData.values,
        backgroundColor: filteredValueData.labels.map(label => getColor(label, colorMapping)),
        borderWidth: 0,
      },
    ],
  };

  const averagePriceData = {
    labels: filteredAveragePriceData.labels,
    datasets: [
      {
        data: filteredAveragePriceData.values,
        backgroundColor: filteredAveragePriceData.labels.map(label => getColor(label, colorMapping)),
        borderWidth: 0,
      },
    ],
  };

  const medianPriceData = {
    labels: filteredMedianPriceData.labels,
    datasets: [
      {
        data: filteredMedianPriceData.values,
        backgroundColor: filteredMedianPriceData.labels.map(label => getColor(label, colorMapping)),
        borderWidth: 0,
      },
    ],
  };

  return { countData, valueData, averagePriceData, medianPriceData, illuvitarsPrices, illuvitarsFloorPrice, illuvitarsAveragePrice, illuvitarsMedianPrice, totalIlluvitarsCount, illuvitarsPercentileBelowMedian, illuvitarsMedianDiscount };
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

export default function Illuvitars({ illuvitars, historical_illuvitars }) {
  const [countPieData, setCountPieData] = useState(null);
  const [valuePieData, setValuePieData] = useState(null);
  const [averagePricePieData, setAveragePricePieData] = useState(null);
  const [medianPricePieData, setMedianPricePieData] = useState(null);
  const [illuvitarStats, setIlluvitarStats] = useState([]);
  const [colorMapping, setColorMapping] = useState({});

  useEffect(() => {
    if (illuvitars && illuvitars.length > 0) {
      const colorMap = { ...colorMapping };
      const data = processOrderData(illuvitars, colorMap);
      setColorMapping(colorMap);
      setCountPieData(data.countData);
      setValuePieData(data.valueData);
      setAveragePricePieData(data.averagePriceData);
      setMedianPricePieData(data.medianPriceData);

      const stats = Object.keys(data.illuvitarsPrices).map((illuvitarName) => ({
        illuvitarName,
        totalCount: data.totalIlluvitarsCount[illuvitarName],
        count: data.illuvitarsPrices[illuvitarName].length,
        floorPrice: data.illuvitarsFloorPrice[illuvitarName],
        averagePrice: data.illuvitarsAveragePrice[illuvitarName],
        medianPrice: data.illuvitarsMedianPrice[illuvitarName],
        percentileBelowMedian: data.illuvitarsPercentileBelowMedian[illuvitarName],
        medianDiscount: data.illuvitarsMedianDiscount[illuvitarName],
        floorDiscount: ((data.illuvitarsMedianPrice[illuvitarName] - data.illuvitarsFloorPrice[illuvitarName]) / data.illuvitarsMedianPrice[illuvitarName]) * 100,
      }));

      stats.sort((a, b) => a.illuvitarName.localeCompare(b.illuvitarName)); // Sorting stats alphabetically by illuvitarName

      setIlluvitarStats(stats);
    }
  }, [illuvitars]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvitars</Heading>
      <Text mb={5}>Information and trends about Illuvitars on the platform.</Text>
      <HStack spacing={4}>
        <a
          href='https://immutascan.io/address/0x8cceea8cfb0f8670f4de3a6cd2152925605d19a8?tab=1&forSale=true&chartTab=UniqueOwners'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Immutascan
          </Button>
        </a>
      </HStack>
      <Flex my={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md" overflow="auto" maxHeight="500px">
          <Text fontSize="2xl" mb={5}>Illuvitar Statistics</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Illuvitar Name</Th>
                <Th>Total</Th>
                <Th>For Sale</Th>
                <Th>Floor Price</Th>
                <Th>Median Price</Th>
                <Th>Median Discount</Th>
                <Th>Average Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {illuvitarStats.map((stat) => (
                <Tr key={stat.illuvitarName}>
                  <Td>{stat.illuvitarName}</Td>
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
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
          <Text fontSize="2xl">Illuvitars Market Cap over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
          <Text fontSize="2xl">Total Amount of Illuvitars for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 4">
          <Text fontSize="2xl">Change in Amount of Illuvitars for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Distribution of Illuvitars for Sale</Text>
          <Pie data={countPieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Total Value of Illuvitars for Sale</Text>
          <Pie data={valuePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Median Price for Sale of Illuvitars</Text>
          <Pie data={medianPricePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Average Price for Sale of Illuvitars</Text>
          <Pie data={averagePricePieData || samplePieData} options={pieOptions} />
        </Box>
      </Grid>
    </Box>
  );
}
