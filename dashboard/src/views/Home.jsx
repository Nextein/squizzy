import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Button, VStack, HStack } from '@chakra-ui/react';
import { Line, Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, samplePieData, options } from '../data/charts';
import axios from 'axios';



const Home = () => {
  const [ilvPrice, setIlvPrice] = useState(0.0);

  async function fetchIlvPrice() {
    let params = {};
    let price; let color;

    try {
      const response = await axios.get("https://api.illuvium-game.io/gamedata/illuvidex/land/get-price?ids=illuvium&include_24hr_change=true&vs_currencies=usd", { params });
      if (response.status !== 200) return;
      const data = response.data;
      price = data.illuvium.usd;
      // color = data.illuvium.usd_24h_change > 0 ? "green.400" : "red"
      setIlvPrice(price);
    } catch (error) {
      console.error("Error fetching ILV price data:", error);
      return;
    }

    return price;
  }
  useEffect(() => {
    fetchIlvPrice();
  }, []);
  return (
    <Box p={5} w='100vw'>
      <Heading as="h1" mb={5}>Home</Heading>
      <Text mb={5}>Overview of the platform with key statistics and trends.</Text>
      <HStack spacing={4} m={5}>
        <a
          href='https://discord.com/channels/1232042093699010702/1232042094172962848'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Discord
          </Button>
        </a>
        <a
          href='https://www.illuvium.io'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            Illuvium
          </Button>
        </a>
        <a
          href='https://illuvidex.illuvium.io/'
          target="_blank"
          rel="noopener noreferrer">
          <Button>
            IlluviDEX
          </Button>
        </a>
        <Text>ILV: $ {ilvPrice ? ilvPrice : 0.4}</Text>
      </HStack>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total wallets change over time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Total lands for sale change over time</Text>
          <Line data={lineData} options={options} />
        </Box>
        <Box></Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Market Cap of each Collection</Text>
          <Pie data={samplePieData} options={options} />
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Amount of items for sale of each Collection</Text>
          <Pie data={samplePieData} options={options} />
        </Box>
        <Box>
          <VStack>

            <Button>SELL BAD ASSETS</Button>
            <Button>SAFE LIQUIDATE</Button>
          </VStack>
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
      </Flex>
    </Box>
  );
};

export default Home;
