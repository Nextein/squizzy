import { Box, Button, FormControl, FormLabel, Grid, Heading, HStack, SimpleGrid, Switch, Text, VStack } from "@chakra-ui/react";
import { LineStyle } from "@mui/icons-material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from "react";

const lines = [
  "Rhamphy",
  "Ador",
  "Scarabok",
  "Alphie",
  "Pho",
  "Squizz",
  "Phyri",
  "Mjoll",
  "Mah'mu",
  "Dash",
  "Ebb",
  "Flare",
  "Fern"
];

const statsApiUrl = "https://api.illuvium-game.io/gamedata/assets/offchain/illuvials/";

export default function Market({ data }) {

  const [marketData, setMarketData] = useState([]);
  const [t5, setT5] = useState(false);
  const [t4, setT4] = useState(false);
  const [s3, setS3] = useState(false);
  const [s2, setS2] = useState(false);
  const [h, setH] = useState(false);
  const [dh, setDh] = useState(false);
  const [stats, setStats] = useState(false);

  useEffect(() => {
    console.log("data:", data);
    setMarketData(
      data.illuvials.map((item, index) => ({ id: index + data.illuvials.length, ...item }))
    );
  }, [data]);

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

  return (
    <Box p={5} w='100vw'>
      <Heading as="h1" mb={5}>Marketplace</Heading>
      <Text mb={5}>Find the best illuvials</Text>
      <FormControl>
        <Text>Search:</Text>
        <SimpleGrid columns={[1, null, 6]} spacing="40px">
          {Object.entries(lines).map(([index, item]) => {
            return (
              <Button bg='gray.200' borderRadius='md' key={index}>
                <Text fontSize='xl'>{item}</Text>
              </Button>
            );
          })}
        </SimpleGrid>
        <Box display='flex' spacing={5}>
          <VStack ml={8}>
            <Box display="flex">
              <FormLabel htmlFor='t5-switch'>T5</FormLabel>
              <Switch id='t5-switch' isChecked={t5} onChange={(e) => setT5(e.target.checked)} />
            </Box>
            <Box display="flex">
              <FormLabel htmlFor='t4-switch'>T4</FormLabel>
              <Switch id='t4-switch' isChecked={t4} onChange={(e) => setT4(e.target.checked)} />
            </Box>
          </VStack>
          <VStack ml={8}>
            <Box display="flex">
              <FormLabel htmlFor='s3-switch'>S3</FormLabel>
              <Switch id='s3-switch' isChecked={s3} onChange={(e) => setS3(e.target.checked)} />
            </Box>
            <Box display="flex">
              <FormLabel htmlFor='s2-switch'>S2</FormLabel>
              <Switch id='s2-switch' isChecked={s2} onChange={(e) => setS2(e.target.checked)} />
            </Box>
          </VStack>
          <VStack ml={8}>
            <Box display="flex">
              <FormLabel htmlFor='h-switch'>H</FormLabel>
              <Switch id='h-switch' isChecked={h} onChange={(e) => setH(e.target.checked)} />
            </Box>
            <Box display="flex">
              <FormLabel htmlFor='dh-switch'>DH</FormLabel>
              <Switch id='dh-switch' isChecked={dh} onChange={(e) => setDh(e.target.checked)} />
            </Box>
          </VStack>
          <Box ml={8} display='flex' >
            <FormLabel htmlFor='stats-switch'>Good Stats</FormLabel>
            <Switch id='stats-switch' isChecked={stats} onChange={(e) => setStats(e.target.checked)} />
          </Box>
        </Box>
      </FormControl>
      <SimpleGrid columns={[1, null, 4]}>
        {marketData.length > 0 && (
          Object.entries(marketData).map(([index, row]) => {
            if (index < 5) {
              let stats;
              try {
                //   stats = await axios.get(statsApiUrl + row.sell.data.properties.token_id);

                //   console.log("STATS--", stats);
              } catch (error) {
                console.log("failed to get stats for ", row.sell.data.properties.token_id);
              }
              return (
                <Box key={index} p={5} bg="gray.400">
                  <Text>{row.sell.data.properties.name}</Text>
                  <img src={row.sell.data.properties.image_url} alt="img" width="200px" />
                  <a href={"https://illuvidex.illuvium.io/asset/0x205634b541080afff3bbfe02dcc89f8fa8a1f1d4/"+row.sell.data.token_id} target="_blank">
                    <Text c="black">
                      {row.sell.data.token_id}
                    </Text>
                  </a>
                </Box>
              );
            } else {
              return undefined;
            }
          })
        )}
      </SimpleGrid>
      {/* {marketData.length > 0 && (

        <Box mt={10} height="75vh">
          <DataGrid
            rows={marketData}
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
      )} */}
    </Box>
  );
}
