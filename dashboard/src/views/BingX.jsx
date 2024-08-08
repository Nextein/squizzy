import { Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from 'axios';

const accountData = [
  { user: "Kai", email: "kailashsuredaquintana", browser: "Kai Phone", assets: 531, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Marc", email: "mgtojar", browser: "Marc Phone", assets: 137, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Blas", email: "blasn314", browser: "Blas Phone", assets: 400, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Gonza", email: "gonxaeskeit1998", browser: "MacM Chrome", assets: 49, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Manu", email: "spanishfumeteo", browser: "MacM Opera", assets: 31, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Sarush", email: "rockitmgc", browser: "MacM Safari", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Maria Elena", email: "epiclysimple", browser: "MacM Brave", assets: 52, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Quico", email: "quicosureda", browser: "Aurora Edge", assets: 371, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Maryu", email: "mgf.4992", browser: "Aurora Opera", assets: 277, open: -1, liquidation: -1, api: "", sec: "", task: "??" },
  { user: "Pana", email: "ppsymmetry", browser: "Aurora Avast", assets: 250, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Diego", email: "diegocampos76", browser: "Aurora Firefox", assets: 255, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Sacha", email: "sacha.lombard94", browser: "Piedra Brave", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Charlotte", email: "duboischarlotte34", browser: "Piedra Chrome", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Soto", email: "sotoj7616", browser: "Piedra Edge", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Sacha2", email: "NA", browser: "Piedra", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Emi", email: "emichinito73", browser: "AlienB Brave", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Marc Ribas", email: "marcribasm", browser: "AlienB Avast", assets: 268, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Nancy", email: "nancysureda74", browser: "AlienB Chrome", assets: 365, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Coco", email: "nmendicote", browser: "AlienB Opera", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Maria Cristina", email: "ilv.umbre", browser: "AlienB Firefox & Alien Firefox", assets: 86, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "AcidVars", email: "acidvarsgestiones", browser: "Alien Opera", assets: 265, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Vikingo", email: "marcos.herreros", browser: "Alien Edge", assets: -1, open: -1, liquidation: -1, api: "", sec: "", task: "code" },
  { user: "Pep", email: "pepseguimendez", browser: "Alien Avast", assets: 314, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Rayito", email: "theekko", browser: "Aurora Brave", assets: 376, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Maria Andrea", email: "mqcryptofund", browser: "Alien Brave", assets: 125, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Maria Flor", email: "mafloren", browser: "Aurora Chrome", assets: 272, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Julieta", email: "ophisto.ilv", browser: "MacR Firefox", assets: 462, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Quico Pujol", email: "quicoso72", browser: "MacR Brave", assets: 263, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Cristina Pujol", email: "titanorsito", browser: "MacR Opera", assets: 527, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Gargufo", email: "chucopabras", browser: "MacR Safari", assets: 59, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Joan", email: "joandlfuente", browser: "MacR Avast", assets: 618, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Anna", email: "scoriox24", browser: "MacR Chrome", assets: 456, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Pera", email: "phosphorus.nft", browser: "MacK Safari", assets: 322, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "Nat", email: "bonhomme.iglesias", browser: "MacK Firefox", assets: 241, open: -1, liquidation: -1, api: "", sec: "", task: "" },
  { user: "AcidVars2", email: "illuvarsgestiones", browser: "MacK Brave", assets: 237, open: -1, liquidation: -1, api: "", sec: "", task: "" },
];


export default function BingX() {
  const [accounts, setAccounts] = useState(accountData);
  const toast = useToast();

  async function fetchAccounts() {
    toast({
      title: "Refreshing...",
      status: "success",
      duration: 1500,
      position: 'top',
    });
    try {

      const accountDetails = await Promise.all(accountData.map(async (account) => {
        const futuresResponse = await axios.get(`https://api.bingx.com/v1/futures/account/${account.username}`, {
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY'
          }
        });
        const futuresData = futuresResponse.data.positions.find(position => position.symbol === 'ILVUSDT' && position.side === 'long');

        return {
          ...account,
          futures: futuresData ? futuresData : null
        };
      }));

      setAccounts(accountDetails);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  return (
    <>
      <Button onClick={fetchAccounts}>
        Refresh
      </Button>
      <Box m={4}>
        <Text># accounts: {accounts.length}</Text>
        <Text># usable: {accounts.filter(account => account.assets >= 200).length}</Text>
        <Text># complete: {accounts.filter(account => account.assets >= 250).length}</Text>
        <Text># missing: {accounts.filter(account => account.assets < 0).length}</Text>
        <Text>$ total: {accounts.reduce((sum, entry) => {
          return sum + (entry.assets > 0 ? entry.assets : 0);
        }, 0)}</Text>
      </Box>
      <Table>
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Browser</Th>
            <Th>Total assets</Th>
            <Th>Open</Th>
            <Th>Liquidation</Th>
            <Th>Mission</Th>
          </Tr>
        </Thead>
        <Tbody>
          {accounts.map((account, index) => (
            <Tr key={index}>
              <Td>{account.user}</Td>
              <Td>{account.email}</Td>
              <Td>{account.browser}</Td>
              <Td color={account.assets >= 250 ? "green.400" : account.assets > 0 ? "red" : "yellow"}>{account.assets}</Td>
              <Td>{account.open}</Td>
              <Td>{account.liquidation}</Td>
              <Td>{account.task}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}