import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, options, samplePieData } from '../data/charts';

const sortData = (data) => {
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);
  return {
    labels: sortedEntries.map(([label]) => label),
    values: sortedEntries.map(([, value]) => value),
  };
};

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

const processLandData = (lands) => {
  const tierCount = {};
  const tierValue = {};
  const tierAveragePrice = {};
  const tierPrices = {};
  const tierFloorPrice = {};
  const totalTierCount = {};

  lands.forEach((land) => {
    const tier = land.metadata?.tier || 'Unknown';
    const sellOrder = land.orders?.sell_orders?.[0];
    const price = sellOrder ? parseFloat(sellOrder.buy_quantity / 10 ** sellOrder.buy_decimals || 0) : 0;

    if (!totalTierCount[tier]) {
      totalTierCount[tier] = 0;
    }
    totalTierCount[tier] += 1;

    if (!sellOrder || price <= 0) return;

    if (!tierCount[tier]) {
      tierCount[tier] = 0;
      tierValue[tier] = 0;
      tierAveragePrice[tier] = 0;
      tierPrices[tier] = [];
      tierFloorPrice[tier] = price;
    }

    tierCount[tier] += 1;
    tierValue[tier] += price;
    tierPrices[tier].push(price);
    if (price < tierFloorPrice[tier]) {
      tierFloorPrice[tier] = price;
    }
  });

  Object.keys(tierCount).forEach((tier) => {
    tierAveragePrice[tier] = tierValue[tier] / tierCount[tier];
    tierPrices[tier].sort((a, b) => a - b); // Sort prices for median calculation
  });

  const tierMedianPrice = {};
  Object.keys(tierPrices).forEach((tier) => {
    tierMedianPrice[tier] = calculateMedian(tierPrices[tier]);
  });

  const sortedCountData = filterNonZeroEntries(tierCount);
  const sortedValueData = filterNonZeroEntries(tierValue);
  const sortedAveragePriceData = filterNonZeroEntries(tierAveragePrice);
  const sortedMedianPriceData = filterNonZeroEntries(tierMedianPrice);

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

  return { countData, valueData, averagePriceData, medianPriceData, tierPrices, tierFloorPrice, tierAveragePrice, tierMedianPrice, totalTierCount };
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

export default function Lands({ lands }) {
  const [countPieData, setCountPieData] = useState(null);
  const [valuePieData, setValuePieData] = useState(null);
  const [averagePricePieData, setAveragePricePieData] = useState(null);
  const [medianPricePieData, setMedianPricePieData] = useState(null);
  const [landStats, setLandStats] = useState([]);

  useEffect(() => {
    if (lands.length > 0) {
      const data = processLandData(lands);
      setCountPieData(data.countData);
      setValuePieData(data.valueData);
      setAveragePricePieData(data.averagePriceData);
      setMedianPricePieData(data.medianPriceData);

      const stats = Object.keys(data.tierPrices).map((tier) => ({
        tier,
        totalCount: data.totalTierCount[tier],
        count: data.tierPrices[tier].length,
        floorPrice: data.tierFloorPrice[tier],
        averagePrice: data.tierAveragePrice[tier],
        medianPrice: data.tierMedianPrice[tier],
      }));
      setLandStats(stats);
    }
  }, [lands]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Lands</Heading>
      <Text mb={5}>Information and trends about Lands on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Land Price Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Min Land Price Change Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box></Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands for Sale Over Time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Distribution of Lands for Sale</Text>
          <Pie data={countPieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of Lands</Text>
          <Pie data={valuePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Median Price for Sale of Lands</Text>
          <Pie data={medianPricePieData || samplePieData} options={pieOptions} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average Price for Sale of Lands</Text>
          <Pie data={averagePricePieData || samplePieData} options={pieOptions} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl" mb={5}>Land Tier Statistics</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tier</Th>
                <Th>Total Count</Th>
                <Th>For Sale Count</Th>
                <Th>Floor Price</Th>
                <Th>Average Price</Th>
                <Th>Median Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {landStats.map((stat) => (
                <Tr key={stat.tier}>
                  <Td>{stat.tier}</Td>
                  <Td>{stat.totalCount}</Td>
                  <Td>{stat.count}</Td>
                  <Td>{stat.floorPrice.toFixed(2)}</Td>
                  <Td>{stat.averagePrice.toFixed(2)}</Td>
                  <Td>{stat.medianPrice.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Flex>
    </Box>
  );
}
