import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Table, Thead, Tbody, Tr, Th, Td, IconButton, useToast, Button, HStack } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, options, samplePieData } from '../data/charts';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { FaClipboard, FaExternalLinkAlt } from 'react-icons/fa';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

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
  const tierPercentileBelowMedian = {};
  const tierMedianDiscount = {};
  Object.keys(tierPrices).forEach((tier) => {
    const median = calculateMedian(tierPrices[tier]);
    tierMedianPrice[tier] = median;
    const belowMedianPrices = tierPrices[tier].filter(price => price < median);
    tierPercentileBelowMedian[tier] = (belowMedianPrices.length / tierPrices[tier].length) * 100;
    tierMedianDiscount[tier] = belowMedianPrices.length > 0 ? calculateMedian(belowMedianPrices) : 0;
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

  return { countData, valueData, averagePriceData, medianPriceData, tierPrices, tierFloorPrice, tierAveragePrice, tierMedianPrice, totalTierCount, tierPercentileBelowMedian, tierMedianDiscount };
};

const handleCellClick = (value, toast) => {
  navigator.clipboard.writeText(value);
  toast({
    title: "Copied to clipboard",
    description: value,
    status: "success",
    duration: 1500,
    position: 'top',
  });
};

const handleCopyLink = (token_address, token_id, toast) => {
  const url = `https://sandbox.illuvidex.illuvium.io/asset/${token_address}/${token_id}`;
  navigator.clipboard.writeText(url);
  toast({
    title: "Link copied to clipboard",
    description: url,
    status: "success",
    duration: 1500,
    position: 'top',
  });
};

const handleButtonClick = (token_address, token_id) => {
  const url = `https://sandbox.illuvidex.illuvium.io/asset/${token_address}/${token_id}`;
  window.open(url, '_blank');
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

const filterNonZeroEntries = (data) => {
  const filteredEntries = Object.entries(data).filter(([, value]) => value > 0);
  return {
    labels: filteredEntries.map(([label]) => label),
    values: filteredEntries.map(([, value]) => value),
  };
};

const processHistoricalData = (historicalData) => {
  const groupedData = historicalData.reduce((acc, data) => {
    const timestamp = new Date(data.timestamp).toISOString().split('T')[0];
    const id = data.data.token_id;
    
    function getTierFromTokenID(id) {
      for (let i=0; i< historicalData.length; i++){
        if (historicalData[i].token_id === id) {
          return historicalData[i].metadata.tier;
        }
      }
      return null;
    }
    const tier = getTierFromTokenID(id);

    if (!acc[timestamp]) {
      acc[timestamp] = {
        totalLandsForSale: 0,
        marketCap: 0,
        totalPrice: 0,
        minPrice: Infinity,
        landCount: 0,
        totalLandsForSaleT1: 0,
        marketCapT1: 0,
        totalPriceT1: 0,
        minPriceT1: Infinity,
        landCountT1: 0,
        totalLandsForSaleT2: 0,
        marketCapT2: 0,
        totalPriceT2: 0,
        minPriceT2: Infinity,
        landCountT2: 0,
        totalLandsForSaleT3: 0,
        marketCapT3: 0,
        totalPriceT3: 0,
        minPriceT3: Infinity,
        landCountT3: 0,
        totalLandsForSaleT4: 0,
        marketCapT4: 0,
        totalPriceT4: 0,
        minPriceT4: Infinity,
        landCountT4: 0,
      };
    }

    const ethPrice = parseFloat(data.buy.data.quantity_with_fees) / 10 ** parseInt(data.buy.data.decimals);
    acc[timestamp].totalLandsForSale += 1;
    acc[timestamp].marketCap += ethPrice;
    acc[timestamp].totalPrice += ethPrice;
    acc[timestamp].minPrice = Math.min(acc[timestamp].minPrice, ethPrice);
    acc[timestamp].landCount += 1;

    if (tier === 1) {
      acc[timestamp].totalLandsForSaleT1 += 1;
      acc[timestamp].marketCapT1 += ethPrice;
      acc[timestamp].totalPriceT1 += ethPrice;
      acc[timestamp].minPriceT1 = Math.min(acc[timestamp].minPriceT1, ethPrice);
      acc[timestamp].landCountT1 += 1;
      console.log("T1");
    } else if (tier === 2) {
      acc[timestamp].totalLandsForSaleT2 += 1;
      acc[timestamp].marketCapT2 += ethPrice;
      acc[timestamp].totalPriceT2 += ethPrice;
      acc[timestamp].minPriceT2 = Math.min(acc[timestamp].minPriceT2, ethPrice);
      acc[timestamp].landCountT2 += 1;
      console.log("T1");
    } else if (tier === 3) {
      acc[timestamp].totalLandsForSaleT3 += 1;
      acc[timestamp].marketCapT3 += ethPrice;
      acc[timestamp].totalPriceT3 += ethPrice;
      acc[timestamp].minPriceT3 = Math.min(acc[timestamp].minPriceT3, ethPrice);
      acc[timestamp].landCountT3 += 1;
      console.log("T1");
    } else if (tier === 4) {
      acc[timestamp].totalLandsForSaleT4 += 1;
      acc[timestamp].marketCapT4 += ethPrice;
      acc[timestamp].totalPriceT4 += ethPrice;
      acc[timestamp].minPriceT4 = Math.min(acc[timestamp].minPriceT4, ethPrice);
      acc[timestamp].landCountT4 += 1;
      console.log("T1");
    }

    return acc;
  }, {});

  console.log("DATA", groupedData);

  const labels = Object.keys(groupedData).sort();
  const totalLandsForSaleData = labels.map(label => groupedData[label].totalLandsForSale);
  const marketCapData = labels.map(label => groupedData[label].marketCap);
  const averagePriceData = labels.map(label => groupedData[label].totalPrice / groupedData[label].landCount);
  const minPriceData = labels.map(label => groupedData[label].minPrice);

  const totalLandsForSaleT1 = labels.map(label => groupedData[label].totalLandsForSaleT1);
  const marketCapT1 = labels.map(label => groupedData[label].marketCapT1);
  const averagePriceT1 = labels.map(label => groupedData[label].totalPriceT1 / groupedData[label].landCountT1);
  const minPriceT1 = labels.map(label => groupedData[label].minPriceT1);

  const totalLandsForSaleT2 = labels.map(label => groupedData[label].totalLandsForSaleT2);
  const marketCapT2 = labels.map(label => groupedData[label].marketCapT2);
  const averagePriceT2 = labels.map(label => groupedData[label].totalPriceT2 / groupedData[label].landCountT2);
  const minPriceT2 = labels.map(label => groupedData[label].minPriceT2);

  const totalLandsForSaleT3 = labels.map(label => groupedData[label].totalLandsForSaleT3);
  const marketCapT3 = labels.map(label => groupedData[label].marketCapT3);
  const averagePriceT3 = labels.map(label => groupedData[label].totalPriceT3 / groupedData[label].landCountT3);
  const minPriceT3 = labels.map(label => groupedData[label].minPriceT3);

  const totalLandsForSaleT4 = labels.map(label => groupedData[label].totalLandsForSaleT4);
  const marketCapT4 = labels.map(label => groupedData[label].marketCapT4);
  const averagePriceT4 = labels.map(label => groupedData[label].totalPriceT4 / groupedData[label].landCountT4);
  const minPriceT4 = labels.map(label => groupedData[label].minPriceT4);

  console.log({
    labels,
    totalLandsForSaleData,
    marketCapData,
    averagePriceData,
    minPriceData,
    totalLandsForSaleT1,
    marketCapT1,
    averagePriceT1,
    minPriceT1,
    totalLandsForSaleT2,
    marketCapT2,
    averagePriceT2,
    minPriceT2,
    totalLandsForSaleT3,
    marketCapT3,
    averagePriceT3,
    minPriceT3,
    totalLandsForSaleT4,
    marketCapT4,
    averagePriceT4,
    minPriceT4,
  });

  return {
    labels,
    totalLandsForSaleData,
    marketCapData,
    averagePriceData,
    minPriceData,
    totalLandsForSaleT1,
    marketCapT1,
    averagePriceT1,
    minPriceT1,
    totalLandsForSaleT2,
    marketCapT2,
    averagePriceT2,
    minPriceT2,
    totalLandsForSaleT3,
    marketCapT3,
    averagePriceT3,
    minPriceT3,
    totalLandsForSaleT4,
    marketCapT4,
    averagePriceT4,
    minPriceT4,
  };
};

export default function Lands({ lands, historical_lands }) {
  const [countPieData, setCountPieData] = useState(null);
  const [valuePieData, setValuePieData] = useState(null);
  const [averagePricePieData, setAveragePricePieData] = useState(null);
  const [medianPricePieData, setMedianPricePieData] = useState(null);
  const [landStats, setLandStats] = useState([]);
  const [historicalChartData, setHistoricalChartData] = useState(null);
  const toast = useToast();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (lands.length > 0) {
      console.log("Lands Data:", lands); // Log the lands data to verify its structure
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
        percentileBelowMedian: data.tierPercentileBelowMedian[tier],
        medianDiscount: data.tierMedianDiscount[tier],
        floorDiscount: ((data.tierMedianPrice[tier] - data.tierFloorPrice[tier]) / data.tierMedianPrice[tier]) * 100,
      }));
      setLandStats(stats);
    }

    if (historical_lands.length > 0) {
      const historicalData = processHistoricalData(historical_lands);
      setHistoricalChartData(historicalData);
    }

    // Ensure lands data has the required 'id' field for DataGrid
    setRows(lands.map((land, index) => ({ id: index, ...land })));

  }, [lands, historical_lands]);

  useEffect(() => {
    console.log(rows);
  }, [rows]);

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Lands</Heading>
      <Text mb={5}>Information and trends about Lands on the platform.</Text>
      <HStack spacing={4}>
        <a
          href="https://market.immutable.com/collections/0x9e0d99b864e1ac12565125c5a82b59adea5a09cd?filters%5Btier%5D%5B%5D=4"
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            IMX Market
          </Button>
        </a>
        <a
          href='https://tokentrove.com/collection/IlluviumLand'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Token Trove
          </Button>
        </a>
        <a
          href='https://dappradar.com/nft-collection/illuvium-land?range-ncs=week'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Analytics
          </Button>
        </a>
        <a
          href='https://immutascan.io/address/0x9e0d99b864e1ac12565125c5a82b59adea5a09cd?tab=1&forSale=true'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Immutascan
          </Button>
        </a>
        <a
          href="https://www.livecoinwatch.com/price/EscrowedIlluvium2-SILV2"
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            SILV2
          </Button>
        </a>
      </HStack>
      <Flex my={10} direction="column" gap={10}>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl" mb={5}>Land Statistics</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tier</Th>
                <Th>Total</Th>
                <Th>For Sale</Th>
                <Th>Floor Price</Th>
                <Th>Median Price</Th>
                <Th>Median Discount</Th>
                <Th>Average Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {landStats.map((stat) => (
                <Tr key={stat.tier}>
                  <Td>{stat.tier}</Td>
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
      <Tabs>
        <TabList>
          <Tab>All</Tab>
          <Tab>T1</Tab>
          <Tab>T2</Tab>
          <Tab>T3</Tab>
          <Tab>T4</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={[1, null, 3]} spacing="40px">
              {historicalChartData ?
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Total Lands for Sale',
                              data: historicalChartData.totalLandsForSaleData,
                              fill: false,
                              backgroundColor: 'rgba(75,192,192,0.4)',
                              borderColor: 'rgba(75,192,192,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Market Cap',
                              data: historicalChartData.marketCapData,
                              fill: false,
                              backgroundColor: 'rgba(153,102,255,0.4)',
                              borderColor: 'rgba(153,102,255,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Average Price',
                              data: historicalChartData.averagePriceData,
                              fill: false,
                              backgroundColor: 'rgba(255,159,64,0.4)',
                              borderColor: 'rgba(255,159,64,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Floor Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Min Price',
                              data: historicalChartData.minPriceData,
                              fill: false,
                              backgroundColor: 'rgba(255,99,132,0.4)',
                              borderColor: 'rgba(255,99,132,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                  </>
                )}
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={[1, null, 3]} spacing="40px">
              {historicalChartData ?
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 1 Lands for Sale',
                              data: historicalChartData.totalLandsForSaleT1,
                              fill: false,
                              backgroundColor: 'rgba(255,99,132,0.4)',
                              borderColor: 'rgba(255,99,132,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 1 Market Cap',
                              data: historicalChartData.marketCapT1,
                              fill: false,
                              backgroundColor: 'rgba(255,99,132,0.4)',
                              borderColor: 'rgba(255,99,132,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 1 Average Price',
                              data: historicalChartData.averagePriceT1,
                              fill: false,
                              backgroundColor: 'rgba(255,99,132,0.4)',
                              borderColor: 'rgba(255,99,132,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 1 Min Price',
                              data: historicalChartData.minPriceT1,
                              fill: false,
                              backgroundColor: 'rgba(255,99,132,0.4)',
                              borderColor: 'rgba(255,99,132,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                  </>
                )}
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={[1, null, 3]} spacing="40px">
              {historicalChartData ?
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Lands for Sale',
                              data: historicalChartData.totalLandsForSaleT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Market Cap',
                              data: historicalChartData.marketCapT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Average Price',
                              data: historicalChartData.averagePriceT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Min Price',
                              data: historicalChartData.minPriceT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                  </>
                )}
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={[1, null, 3]} spacing="40px">
              {historicalChartData ?
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Lands for Sale',
                              data: historicalChartData.totalLandsForSaleT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Market Cap',
                              data: historicalChartData.marketCapT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Average Price',
                              data: historicalChartData.averagePriceT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 2 Min Price',
                              data: historicalChartData.minPriceT2,
                              fill: false,
                              backgroundColor: 'rgba(54,162,235,0.4)',
                              borderColor: 'rgba(54,162,235,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                  </>
                )}
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
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={[1, null, 3]} spacing="40px">
              {historicalChartData ?
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 3 Lands for Sale',
                              data: historicalChartData.totalLandsForSaleT3,
                              fill: false,
                              backgroundColor: 'rgba(255,206,86,0.4)',
                              borderColor: 'rgba(255,206,86,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 3 Market Cap',
                              data: historicalChartData.marketCapT3,
                              fill: false,
                              backgroundColor: 'rgba(255,206,86,0.4)',
                              borderColor: 'rgba(255,206,86,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 3 Average Price',
                              data: historicalChartData.averagePriceT3,
                              fill: false,
                              backgroundColor: 'rgba(255,206,86,0.4)',
                              borderColor: 'rgba(255,206,86,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={{
                          labels: historicalChartData.labels,
                          datasets: [
                            {
                              label: 'Tier 3 Min Price',
                              data: historicalChartData.minPriceT3,
                              fill: false,
                              backgroundColor: 'rgba(255,206,86,0.4)',
                              borderColor: 'rgba(255,206,86,1)',
                            },
                          ],
                        }}
                        options={options}
                      />
                    </Box>
                  </>
                )
                :
                (
                  <>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Total Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Market Cap of Lands for Sale Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Average Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                    <Box bg="gray.100" p={5} borderRadius="md">
                      <Text fontSize="2xl">Min Land Price Change Over Time</Text>
                      <Line
                        data={lineData}
                        options={options}
                      />
                    </Box>
                  </>
                )}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
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
    </Box>
  );
}
