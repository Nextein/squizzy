import React from 'react';
import { Box, Heading, Text, SimpleGrid, Flex, Center, Button } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import '../chartConfig';
import { lineData, pieData, options } from '../data/charts';

function Illuvials() {

  return (
    <Box p={5}>
      <Center>
        <Heading as="h1" mb={5}>Illuvials</Heading>
      </Center>
      <SimpleGrid columns={[1, null, 3]} spacing="40px">
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 1</Text>
          <Text>Value</Text>
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 2</Text>
          <Text>Value</Text>
        </Box>
        <Box bg="gray.100" p={5} borderRadius="md">
          <Text fontSize="2xl">Stat 3</Text>
          <Text>Value</Text>
        </Box>
      </SimpleGrid>
      <Flex mt={10} direction="column" gap={10}>
        <Box>
          <Line data={lineData} options={options} />
        </Box>
        <Box>
          <Pie data={pieData} options={options} />
        </Box>
        <Box>
          Ranking points over time
        </Box>
        <Box>
          Total wallets change over time
        </Box>

        <Box>
          Total lands for sale change over time
        </Box>
        <Box>
          MCap lands for sale change over time
        </Box>
        <Box>
          Average land price change over time
        </Box>
        <Box>
          Min land price change over time
        </Box>
        <Box>
          Total wallets over time
        </Box>
        <Box>
          Total lands for sale over time
        </Box>
        <Box>
          MCap lands for sale over time
        </Box>
        <Box>
          Average land price over time
        </Box>
        <Box>
          Min land price over time
        </Box>
        <Box>
          Illuvials MCap over time
        </Box>
        <Box>
          Illuvitars MCap over time
        </Box>
        <Box>
          Lands MCap over time
        </Box>
        <Box>
          Shards MCap over time
        </Box>
        <Box>
          Amount of bad assets in Baloth
        </Box>
        <Box>
          Mcap of bad assets in Baloth
        </Box>
        <Box>
          $ value (Mcap) of good assets over time
        </Box>
        <Button>SELL BAD ASSETS</Button>
        <Button>SAFE LIQUIDATE</Button>
        <Box>
          Pie amount of illuvials for sale
        </Box>
        <Box>
          Pie amount of illuvitars for sale
        </Box>
        <Box>
          Pie amount of lands for sale
        </Box>
        <Box>
          Total amount of illuvials for sale over time
        </Box>
        <Box>
          Total amount of illuvitars for sale over time
        </Box>
        <Box>
          Total amount of lands for sale over time
        </Box>
        <Box>
          Total amount of illuvials for sale change over time
        </Box>
        <Box>
          Total amount of illuvitars for sale change over time
        </Box>
        <Box>
          Total amount of lands for sale change over time
        </Box>
        <Box>
          Pie Mcap illuvials
        </Box>
        <Box>
          Pie Mcap illuvitars
        </Box>
        <Box>
          Pie Mcap lands
        </Box>
        <Box>
          Pie Mcap collections
        </Box>
        <Box>
          Pie average price for sale illuvials
        </Box>
        <Box>
          Pie average price for sale illuvitars
        </Box>
        <Box>
          Pie average price for sale lands
        </Box>
        <Box>
          average price over time illuvials
        </Box>
        <Box>
          Pie average price over time illuvitars
        </Box>
        <Box>
          Pie average price over time lands
        </Box>
        <Box>
          Average $ value of wallets over time
        </Box>
          
      </Flex>
    </Box>
  );
}

export default Illuvials;
