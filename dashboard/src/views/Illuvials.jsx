import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Table, Thead, Tbody, Tr, Th, Td, Grid, Input, Button, HStack, FormControl, FormLabel, Switch } from '@chakra-ui/react';
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

const processOrderData = (illuvials, colorMapping) => {
  const illuvialsData = illuvials.filter(order =>
    order.sell &&
    order.sell.data &&
    order.sell.data.properties &&
    order.sell.data.properties.collection &&
    order.sell.data.properties.collection.name === 'Illuvium Illuvials' &&
    order.buy.data.quantity_with_fees > 0
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
      if (quantity === 0.0) {
        console.log(order);
      }
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

export default function Illuvials({ illuvials, historical_illuvials }) {
  const [countPieData, setCountPieData] = useState(null);
  const [valuePieData, setValuePieData] = useState(null);
  const [averagePricePieData, setAveragePricePieData] = useState(null);
  const [medianPricePieData, setMedianPricePieData] = useState(null);
  const [illuvialStats, setIlluvialStats] = useState([]);
  const [colorMapping, setColorMapping] = useState({});
  const [illuvial, setIlluvial] = useState("");
  const [prices, setIlluvialsPrices] = useState([1, 2, 3]);
  const [ethPrice, setEthPrice] = useState(3500);
  const [eth, setEth] = useState(false);

  useEffect(() => {
    if (illuvials.length > 0) {
      const colorMap = { ...colorMapping };
      const data = processOrderData(illuvials, colorMap);
      setColorMapping(colorMap);
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

      stats.sort((a, b) => a.illuvialName.localeCompare(b.illuvialName)); // Sorting stats alphabetically by illuvialName

      setIlluvialStats(stats);
      setIlluvialsPrices(data.illuvialsPrices);
      console.log("prices", data.illuvialsPrices);
    }
  }, [illuvials]);

  function handleIlluvialSearch() {
    console.log("illuvial searched: " + illuvial)
  }

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Illuvials</Heading>
      <Text mb={5}>Information and trends about Illuvials on the platform.</Text>
      <Flex my={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md" overflow="auto" maxHeight="500px">
          <HStack>
            <Text fontSize="2xl" mb={5}>Illuvial Statistics</Text>
            <Text>${ethPrice}</Text>
            <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='eth-switch' mb='0'>
                ETH
              </FormLabel>
              <Switch id='eth-switch' isChecked={eth} onChange={(e) => setEth(e.target.checked)} />
            </FormControl>
          </HStack>
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
                    {eth ? stat.floorPrice.toFixed(5) : stat.floorPrice.toFixed(7) * ethPrice}
                    <Box as="span" color="gray.500" ml={2}>
                      ({((1 - stat.floorPrice / stat.medianPrice) * 100).toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>
                    {eth ? stat.medianPrice.toFixed(5) : stat.medianPrice.toFixed(7) * ethPrice}
                    <Box as="span" color="gray.500" ml={2}>
                      ({stat.percentileBelowMedian.toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>
                    {eth ? stat.medianDiscount.toFixed(5) : stat.medianDiscount.toFixed(7) * ethPrice}
                    <Box as="span" color="gray.500" ml={2}>
                      ({((1 - stat.medianDiscount / stat.medianPrice) * 100).toFixed(1)}%)
                    </Box>
                  </Td>
                  <Td>{eth ? stat.averagePrice.toFixed(5) : stat.averagePrice * ethPrice}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Flex>
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
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Distribution of Illuvials for Sale</Text>
          <Pie data={countPieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Total Value of Illuvials for Sale</Text>
          <Pie data={valuePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Median Price for Sale of Illuvials</Text>
          <Pie data={medianPricePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" gridColumn="span 6">
          <Text fontSize="2xl">Average Price for Sale of Illuvials</Text>
          <Pie data={averagePricePieData || samplePieData} options={pieOptions} />
        </Box>
      </Grid>
      <Flex my={10} direction="column" gap={10}>
        <Box>
          <Text fontSize={'xl'}>Illuvial</Text>
          <Input type='text' value={illuvial} onChange={(e) => setIlluvial(e.target.value)}>
          </Input>
          <Button onClick={handleIlluvialSearch}>
            search
          </Button>
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md" overflow="auto" maxHeight="500px">
          <Text fontSize="2xl" mb={5}>Illuvial Statistics</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>test</Td>
                <Td>test</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Box>

  );
}
