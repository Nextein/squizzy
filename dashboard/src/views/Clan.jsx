import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Button, Select, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react';
import axios from 'axios';

const sampleUsers = [
  { username: 'Baloth', walletAddress: '0x2179577a53b40874a821476281c45096fe2bfd60' },
  { username: 'chupacabras', walletAddress: '0xa4c798ef92f4c538b2f581ff68a01fc7bfad5e90' },
  { username: 'Capacitor | HYPE', walletAddress: '0xd78f0506c427a53b7ff0850ddde6d30fd0249069' }
];

const Clan = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletContents, setWalletContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState('');
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
      setWalletContents(response.data.result);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(selectedWalletAddress).then(() => {
      toast({
        title: "Wallet address copied.",
        description: "The wallet address has been copied to your clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "center",
      });
    });
  };

  return (
    <Box p={5}>
      <Heading as="h1" mb={5}>Clan</Heading>
      <Text mb={5}>Select a user to view their IMX wallet contents.</Text>
      <Select placeholder="Select user" onChange={handleUserChange}>
        {sampleUsers.map((user) => (
          <option key={user.walletAddress} value={user.walletAddress}>
            {user.username} - {user.walletAddress}
          </option>
        ))}
      </Select>
      {selectedWalletAddress && (
        <Box mt={5}>
          <Text fontSize="xl">
            Wallet Address:{" "}
            <Button onClick={handleCopyToClipboard} variant="link" colorScheme="teal">
              {selectedWalletAddress}
            </Button>
          </Text>
        </Box>
      )}
      {isLoading && <Text mt={5}>Loading wallet contents...</Text>}
      {selectedUser && walletContents.length > 0 && (
        <Box mt={10}>
          <Heading as="h2" size="lg" mb={5}>Wallet Contents</Heading>
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Token Address</Th>
                <Th>Token ID</Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Image</Th>
                <Th>Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {walletContents.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.token_address}</Td>
                  <Td>{item.token_id}</Td>
                  <Td>{item.name}</Td>
                  <Td>{item.description}</Td>
                  <Td><img src={item.image_url} alt={item.name} width="50" /></Td>
                  <Td>{item.metadata ? item.metadata.points : 'N/A'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Clan;
