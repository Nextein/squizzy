import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import '../chartConfig';
import ADDRESS from '../data/addresses';
import users from '../data/users';

const Wallets = () => {
  const [lineData, setLineData] = useState({});
  const [pieData, setPieData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchOwnersForContract = async () => {
    const API_URL = "https://api.imx.io/v1/getOwnersForContract";
    const params = {
      contractAddress: ADDRESS.test_illuvials,  // Replace with actual contract address
      blockchain: "ethereum",
      network: "testnet",
      walletId: users[0].walletAddress,  // Replace with actual wallet ID
      limit: 10,
      offset: 0
    };

    try {
      const response = await axios.get(API_URL, { params });
      if (response.status !== 200) {
        console.error("Failed to fetch data: HTTP Status Code", response.status);
        return [];
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return [];
    }
  };

  const processData = (data) => {
    const lineChartData = {
      labels: [], // populate with appropriate labels
      datasets: [
        {
          label: 'Total Wallets Over Time',
          data: [], // populate with data from API
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1
        },
        {
          label: 'Average $ Value of Wallets Over Time',
          data: [], // populate with data from API
          fill: false,
          borderColor: 'rgba(153,102,255,1)',
          tension: 0.1
        },
      ]
    };

    const pieChartData = {
      labels: [], // populate with wallet addresses
      datasets: [
        {
          label: 'Wallets Market Capitalization Distribution',
          data: [], // populate with data from API
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ]
        }
      ]
    };

    // Process data from API to fill in the datasets
    // Example processing logic

    const totalWalletsOverTime = {}; // Populate this object with your data processing logic
    const averageValueOverTime = {}; // Populate this object with your data processing logic

    data.forEach(entry => {
      // Extract and process the necessary data for the charts
      const timestamp = new Date(entry.timestamp).toLocaleDateString(); // Adjust to your desired format
      const walletValue = entry.value; // Replace with actual data field
      
      if (!totalWalletsOverTime[timestamp]) {
        totalWalletsOverTime[timestamp] = 0;
      }
      totalWalletsOverTime[timestamp] += 1;

      if (!averageValueOverTime[timestamp]) {
        averageValueOverTime[timestamp] = { totalValue: 0, count: 0 };
      }
      averageValueOverTime[timestamp].totalValue += walletValue;
      averageValueOverTime[timestamp].count += 1;
    });

    lineChartData.labels = Object.keys(totalWalletsOverTime);
    lineChartData.datasets[0].data = Object.values(totalWalletsOverTime);
    lineChartData.datasets[1].data = Object.keys(averageValueOverTime).map(timestamp => {
      const { totalValue, count } = averageValueOverTime[timestamp];
      return totalValue / count;
    });

    // Example: Calculate distribution of wallets
    const walletDistribution = {};

    data.forEach(entry => {
      const walletAddress = entry.wallet; // Replace with actual data field

      if (!walletDistribution[walletAddress]) {
        walletDistribution[walletAddress] = 0;
      }
      walletDistribution[walletAddress]++;
    });

    pieChartData.labels = Object.keys(walletDistribution);
    pieChartData.datasets[0].data = Object.values(walletDistribution);

    setLineData(lineChartData);
    setPieData(pieChartData);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchOwnersForContract();
      console.log(data);
      processData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Wallets</Heading>
      <Text mb={5}>Information and trends about wallets on the platform.</Text>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total Wallets Over Time</Text>
          <Line data={lineData} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Average $ Value of Wallets Over Time</Text>
          <Line data={lineData} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Wallets Market Capitalization Distribution</Text>
          <Pie data={pieData} />
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
      </Flex>
    </Box>
  );
};

export default Wallets;
