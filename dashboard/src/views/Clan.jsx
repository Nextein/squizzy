import React, { useState } from 'react';
import { Box, Heading, Text, Select, useToast, Button, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import users from '../data/users';

const theme = createTheme();

const Clan = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletContents, setWalletContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [stats, setStats] = useState({ totalItems: 0, totalPoints: 0, illuvials: {}, shards: {}, plants: {}, essences: {}, holo: 0, darkHolo: 0 });
  const toast = useToast();

  const handleUserChange = async (event) => {
    const walletAddress = event.target.value;
    setSelectedUser(walletAddress);
    setSelectedWalletAddress(walletAddress);
    setIsLoading(true);

    let contents = [];
    let cursor = '';
    try {
      do {
        const response = await axios.get(`https://api.sandbox.x.immutable.com/v1/assets`, {
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

      setWalletContents(contents);

      // Calculate stats
      const totalItems = contents.length;
      const totalPoints = contents.reduce((sum, item) => sum + (item.metadata?.points || 0), 0);

      // Initialize stats
      const illuvials = {};
      const shards = {};
      const plants = {};
      const essences = {};
      let holo = 0;
      let darkHolo = 0;

      contents.forEach(item => {
        const { name, holo: holoItem, darkHolo: darkHoloItem, Tier } = item.metadata || {};
        if (item.collection.name === 'Illuvium Illuvials') {
          illuvials[name] = { count: (illuvials[name]?.count || 0) + 1, tier: Tier };
          if (holoItem) holo += 1;
          if (darkHoloItem) darkHolo += 1;
        } else if (item.collection.name === 'Illuvium Shards') {
          shards[name] = (shards[name] || 0) + 1;
        } else if (item.collection.name === 'Illuvium Plants') {
          plants[name] = (plants[name] || 0) + 1;
        } else if (item.collection.name === 'Illuvium Essences') {
          essences[name] = (essences[name] || 0) + 1;
        }
      });

      setStats({ totalItems, totalPoints, illuvials, shards, plants, essences, holo, darkHolo });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
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
  ];

  const tierColors = {
    1: "blue.100",
    2: "green.100",
    3: "yellow.100",
    4: "orange.100",
    5: "red.100"
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box p={5} w='100vw'>
        <Heading as="h1" mb={5}>Clan</Heading>
        <Text mb={5}>Select a user to view their IMX wallet contents.</Text>
        <Select placeholder="Select user" onChange={handleUserChange}>
          {users.map((user) => (
            <option key={user.walletAddress} value={user.walletAddress}>
              {user.username} - {user.walletAddress}
            </option>
          ))}
        </Select>
        {selectedWalletAddress && (
          <Box mt={5}>
            <Text fontSize="xl">
              Wallet Address:{" "}
              <Button onClick={() => handleCellClick(selectedWalletAddress)} variant="link" colorScheme="teal">
                {selectedWalletAddress}
              </Button>
            </Text>
          </Box>
        )}
        {isLoading && <Text mt={5}>Loading wallet contents...</Text>}
        {selectedUser && walletContents.length > 0 && (
          <>
            <SimpleGrid columns={[1, null, 8]} spacing="40px" mt={5}>
              {Object.entries(stats.illuvials)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([illuvial, { count, tier }]) => (
                  <Box bg={tierColors[tier]} p={5} borderRadius="md" key={illuvial}>
                    <Text fontSize="xl">{illuvial}</Text>
                    <Text>{count}</Text>
                  </Box>
                ))}
            </SimpleGrid>
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
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Clan;
