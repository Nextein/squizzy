import React, { useState } from 'react';
import { Box, Heading, Text, Select, useToast, Button, Stat, StatLabel, StatNumber, StatHelpText, StatGroup } from '@chakra-ui/react';
import axios from 'axios';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { FileCopy as CopyIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme();

const users = [
  { username: 'Baloth', walletAddress: '0x2179577a53b40874a821476281c45096fe2bfd60' },
  { username: 'chupacabras', walletAddress: '0xa4c798ef92f4c538b2f581ff68a01fc7bfad5e90' },
  { username: 'Capacitor | HYPE', walletAddress: '0xd78f0506c427a53b7ff0850ddde6d30fd0249069' }
];

const Clan = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletContents, setWalletContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
  const [stats, setStats] = useState({ totalItems: 0, totalPoints: 0 });
  const toast = useToast();

  const handleUserChange = async (event) => {
    const walletAddress = event.target.value;
    setSelectedUser(walletAddress);
    setSelectedWalletAddress(walletAddress);
    setIsLoading(true);
    try {
      const response = await axios.get(`https://api.sandbox.x.immutable.com/v1/assets`, {
        params: {
          user: walletAddress,
          page_size: 200,
          order_by: 'updated_at'
        }
      });
      const contents = response.data.result.map((item, index) => ({ id: index, ...item }));
      setWalletContents(contents);

      // Calculate stats
      const totalItems = contents.length;
      const totalPoints = contents.reduce((sum, item) => sum + (item.metadata?.points || 0), 0);
      setStats({ totalItems, totalPoints });
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
    { field: "token_address", headerName: "Token Address", flex: 1 },
    { field: "token_id", headerName: "Token ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "image_url", headerName: "Image", flex: 1,
      renderCell: (params) => (
        <img src={params.value} alt={params.row.name} width="50" />
      )
    },
    { field: "metadata.points", headerName: "Points", flex: 1 },
    {
      field: "copy",
      headerName: "Copy",
      width: 50,
      renderCell: (params) => (
        <IconButton onClick={() => handleCellClick(params.row.token_address)}>
          <CopyIcon />
        </IconButton>
      ),
    },
  ];

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
          <Box mt={10} height="75vh">
            <StatGroup mb={5}>
              <Stat>
                <StatLabel>Total Items</StatLabel>
                <StatNumber>{stats.totalItems}</StatNumber>
                <StatHelpText>Items in wallet</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Points</StatLabel>
                <StatNumber>{stats.totalPoints}</StatNumber>
                <StatHelpText>Points from items</StatHelpText>
              </Stat>
            </StatGroup>
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
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Clan;
