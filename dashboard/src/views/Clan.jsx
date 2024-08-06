import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Select, useToast, Button, SimpleGrid, Center, VStack, Input, Spinner, IconButton, Table, Tbody, Tr, Td } from '@chakra-ui/react';
import { FaExternalLinkAlt, FaClipboard } from 'react-icons/fa';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import users from '../data/users';

const theme = createTheme();

const Clan = ({ illuvialOrders = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletContents, setWalletContents] = useState([]);
  const [illuvialData, setIlluvialData] = useState({ floorPrice: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    totalPoints: 0,
    illuvials: {},
    shards: {},
    plants: {},
    essences: {},
    holo: 0,
    darkHolo: 0
  });
  const toast = useToast();

  const fetchUserData = async (walletAddress) => {
    let contents = [];
    let cursor = '';
    try {
      do {
        const response = await axios.get(`https://api.x.immutable.com/v1/assets`, {
          params: {
            user: walletAddress,
            page_size: 200,
            order_by: 'updated_at',
            cursor: cursor
          }
        });
        const newContents = response.data.result.map((item, index) => ({ id: index + contents.length, ...item }));
        contents = [...contents, ...newContents];
        cursor = response.data.cursor;

      } while (cursor);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
    return contents;
  };

  const calculateMedian = (values) => {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) return values[half];
    return (values[half - 1] + values[half]) / 2.0;
  };

  const filterNonZeroEntries = (data) => {
    const filteredEntries = Object.entries(data).filter(([, value]) => value > 0);
    return {
      labels: filteredEntries.map(([label]) => label),
      values: filteredEntries.map(([, value]) => value),
    };
  };

  const removeBottomPercentile = (data, percentile = 80) => {
    const thresholdIndex = Math.floor(data.values.length * (percentile / 100));
    return {
      labels: data.labels.slice(0, -thresholdIndex),
      values: data.values.slice(0, -thresholdIndex),
    };
  };

  const processOrderData = (illuvials) => {
    if (!Array.isArray(illuvials) || illuvials.length === 0) return { floorPrice: {} };

    const illuvialsCount = {};
    const illuvialsValue = {};
    const illuvialsAveragePrice = {};
    const illuvialsPrices = {};
    const illuvialsFloorPrice = {};
    const totalIlluvialsCount = {};

    illuvials.forEach(order => {
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

    const filteredCountData = removeBottomPercentile(sortedCountData);
    const filteredValueData = removeBottomPercentile(sortedValueData);
    const filteredAveragePriceData = removeBottomPercentile(sortedAveragePriceData);
    const filteredMedianPriceData = removeBottomPercentile(sortedMedianPriceData);

    return { floorPrice: illuvialsFloorPrice };
  };

  const aggregateStats = (contents) => {
    const totalItems = contents.length;
    const totalPoints = contents.reduce((sum, item) => sum + (item.metadata?.points || 0), 0);

    const illuvials = {};
    const shards = {};
    const plants = {};
    const essences = {};
    const gems = {};
    let holo = 0;
    let darkHolo = 0;

    contents.forEach(item => {
      const { name, Finish, Tier } = item.metadata || {};
      if (item.collection.name === 'Illuvium Illuvials') {
        if (!illuvials[name]) {
          illuvials[name] = { count: 0, tier: Tier, holoCount: 0, darkHoloCount: 0 };
        }
        illuvials[name].count += 1;
        if (Finish === 'Holo') {
          illuvials[name].holoCount += 1;
          holo += 1;
        }
        if (Finish === 'DarkHolo') {
          illuvials[name].darkHoloCount += 1;
          darkHolo += 1;
        }
      } else if (item.collection.name === 'Illuvium Shards') {
        if (!shards[name]) {
          shards[name] = { count: 0 };
        }
        shards[name].count += 1;
      } else if (item.collection.name === 'Illuvium Plants') {
        if (!plants[name]) {
          plants[name] = { count: 0 };
        }
        plants[name].count += 1;
      } else if (item.collection.name === 'Illuvium Essences') {
        if (!essences[name]) {
          essences[name] = { count: 0 };
        }
        essences[name].count += 1;
      } else if (item.collection.name === 'Illuvium Gems') {
        if (!gems[name]) {
          gems[name] = { count: 0 };
        }
        gems[name].count += 1;
      }
    });

    return { totalItems, totalPoints, illuvials, shards, plants, essences, gems, holo, darkHolo };
  };

  const handleUserChange = async (event) => {
    const walletAddress = event.target.value;
    setSelectedUser(walletAddress);
    setSelectedWalletAddress(walletAddress);
    setIsLoading(true);

    if (walletAddress === "all") {
      let allContents = [];
      for (const user of users) {
        const userContents = await fetchUserData(user.walletAddress);
        allContents = [...allContents, ...userContents];
      }
      setWalletContents(allContents);
      setStats(aggregateStats(allContents));
    } else {
      const contents = await fetchUserData(walletAddress);
      setWalletContents(contents);
      setStats(aggregateStats(contents));
    }

    const data = processOrderData(illuvialOrders);
    setIlluvialData(data);

    setIsLoading(false);
  };

  const handleManualAddressSubmit = async () => {
    setSelectedUser(manualWalletAddress);
    setSelectedWalletAddress(manualWalletAddress);
    setIsLoading(true);

    const contents = await fetchUserData(manualWalletAddress);
    setWalletContents(contents);
    setStats(aggregateStats(contents));

    const data = processOrderData(illuvialOrders);
    setIlluvialData(data);

    setIsLoading(false);
  };

  const handleCellClick = (value) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: value,
      status: "success",
      duration: 1500,
      position: 'top',
    });
  };

  const handleButtonClick = (token_address, token_id) => {
    const url = `https://illuvidex.illuvium.io/asset/${token_address}/${token_id}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (token_address, token_id) => {
    const url = `https://illuvidex.illuvium.io/asset/${token_address}/${token_id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied to clipboard",
      description: url,
      status: "success",
      duration: 1500,
      position: 'top',
    });
  };

  const calculateTotalValue = (illuvials, floorPrices) => {
    return Object.entries(illuvials).reduce((sum, [name, { count }]) => {
      const floorPrice = floorPrices && floorPrices[name] ? floorPrices[name] : 0;
      return sum + (floorPrice * count);
    }, 0);
  };

  const columns = [
    {
      field: "token_address", headerName: "Token Address", flex: 1,
      renderCell: (params) => (
        <Text onClick={() => handleCellClick(params.value)}>{params.value}</Text>
      )
    },
    {
      field: "token_id", headerName: "Token ID", flex: 1,
      renderCell: (params) => (
        <Text onClick={() => handleCellClick(params.value)}>{params.value}</Text>
      )
    },
    {
      field: "name", headerName: "Name", flex: 1,
      renderCell: (params) => (
        <Text onClick={() => handleCellClick(params.value)}>{params.value}</Text>
      )
    },
    {
      field: "image_url", headerName: "Image", flex: 1,
      renderCell: (params) => (
        <img src={params.value} alt={params.row.name} width="50" />
      )
    },
    {
      field: "action", headerName: "Actions", flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            icon={<FaClipboard />}
            aria-label="Copy Link"
            onClick={() => handleCopyLink(params.row.token_address, params.row.token_id)}
            mr={2}
          />
          <IconButton
            icon={<FaExternalLinkAlt />}
            aria-label="View"
            onClick={() => handleButtonClick(params.row.token_address, params.row.token_id)}
          />
        </Box>
      )
    },
  ];

  const tierColors = {
    1: "blue.100",
    2: "green.100",
    3: "yellow.100",
    4: "orange.100",
    5: "red.100"
  };

  const renderStatsSection = (title, data, color) => (
    <Box mt={5} overflowX="auto">
      <Heading as="h2" size="md" mb={3}>{title}</Heading>
      <SimpleGrid columns={[1, null, 8]} spacing="40px">
        {Object.entries(data || {})
          .sort(([nameA, dataA], [nameB, dataB]) => {
            if (dataA.tier !== dataB.tier) {
              return dataB.tier - dataA.tier; // Sort by tier in descending order
            }
            return nameA.localeCompare(nameB); // If tiers are equal, sort alphabetically
          })
          .map(([name, { count, tier, holoCount = 0, darkHoloCount = 0 }]) => (
            <Box bg={tierColors[tier] || color} p={5} borderRadius="md" key={name}>
              <Text fontSize="xl">{name}</Text>
              {holoCount > 0 && <Text>Holo: {holoCount}</Text>}
              {darkHoloCount > 0 && <Text>Dark Holo: {darkHoloCount}</Text>}
              <Table>
                <Tbody>
                  <Tr>
                    <Td>
                      <Text>Total: {count}</Text>
                    </Td>
                    <Td>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          ))}
      </SimpleGrid>
    </Box>
  );

  const calculateTotal = (counts) => {
    let total = 0;
    for (let key in counts) {
      if (counts.hasOwnProperty(key)) {
        total += counts[key];
      }
    }
    return total;
  };

  function openProfile(name) {
    const url = `https://illuvidex.illuvium.io/ranger/${name}`;
    window.open(url, '_blank');
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box p={5} w='100vw'>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Center>
            <VStack>
              <Heading as="h1" mb={5}>Clan</Heading>
              <Text>Members</Text>
              <Table>
                <Tbody>
                  TODO
                </Tbody>
              </Table>
              <Text mb={5}>Select a user to view their IMX wallet contents.</Text>
              <Select placeholder="Select user" onChange={handleUserChange}>
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user.walletAddress} value={user.walletAddress}>
                    {user.username}
                  </option>
                ))}
              </Select>
              <Box mt={5}>
                <Text>Or enter a wallet address:</Text>
                <Input
                  placeholder="Wallet Address"
                  value={manualWalletAddress}
                  onChange={(e) => setManualWalletAddress(e.target.value)}
                  mt={2}
                />
                <Button onClick={handleManualAddressSubmit} m={2} colorScheme="teal">
                  Load Wallet
                </Button>
              </Box>
              {selectedWalletAddress && selectedWalletAddress !== 'all' && (
                <Box mt={5}>
                  <Text fontSize="xl">
                    Wallet Address:{" "}
                    <Button onClick={() => handleCellClick(selectedWalletAddress)} variant="link" colorScheme="teal">
                      {selectedWalletAddress}
                    </Button>
                  </Text>
                  <Button p={2} m={2} onClick={() =>{openProfile(selectedUser)}}>
                    Illuvidex
                  </Button>
                </Box>
              )}
            </VStack>
          </Center>
        </Box>
        {isLoading &&
          <>
            <Text mt={5}>Loading wallet contents...</Text>
            <Spinner />
          </>
        }
        {selectedUser && walletContents.length > 0 && (
          <>
            {renderStatsSection('Shards', stats.shards, 'gray.100')}
            <Box mt={5} overflowX="auto">
              <Heading as="h2" size="md" mb={3}>Holos</Heading>
              <SimpleGrid columns={[1, null, 8]} spacing="40px" mt={5}>
                <Box borderRadius={'md'} bg='purple.100' p={5}>
                  <Text fontSize="xl">Holos</Text>
                  <Text>{stats.holo}</Text>
                </Box>
                <Box borderRadius={'md'} bg='purple.100' p={5}>
                  <Text fontSize="xl">Dark Holos</Text>
                  <Text>{stats.darkHolo}</Text>
                </Box>
              </SimpleGrid>
            </Box>
            {renderStatsSection('Illuvials', stats.illuvials, tierColors)}
            <Text>total illuvials: {
              calculateTotal(stats.illuvials.totalIlluvialsCount)
            }</Text>
            {renderStatsSection('Plants', stats.plants, 'green.100')}
            {renderStatsSection('Essences', stats.essences, 'purple.100')}
            {renderStatsSection('Gems', stats.gems, 'purple.100')}
            <Box mt={10} height="75vh">
              <DataGrid
                rows={walletContents}
                columns={columns}
                components={{ Toolbar: GridToolbar }}
                checkboxSelection={false}
                density="compact"
                sx={{
                  "& .MuiDataGrid-root": { border: "none" },
                  "& .MuiDataGrid-cell": { cursor: "pointer" },
                  "& .MuiDataGrid-columnHeaders": { backgroundColor: 'primary.main', borderBottom: "none" },
                  "& .MuiDataGrid-virtualScroller": { backgroundColor: 'background.paper' },
                  "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: 'primary.main' },
                  '& .MuiDataGrid-toolbarContainer .MuiButton-text': { color: 'text.primary' },
                }}
              />
            </Box>
            <Box mt={5}>
              <Heading as="h2" size="lg" mb={3}>Total Wallet Value</Heading>
              <Text fontSize="2xl">{calculateTotalValue(stats.illuvials, illuvialData.floorPrice).toFixed(2)} IMX</Text>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Clan;
