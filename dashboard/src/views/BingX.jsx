import { Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from 'axios';

const accountData = [
{ user: "Kai", email: "kailashsuredaquintana", browser: "Kai Phone", assets: 531, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Marc", email: "mgtojar", browser: "Marc Phone", assets: 137, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Blas", email: "blasn314", browser: "Blas Phone", assets: 400, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Gonza", email: "gonxaeskeit1998", browser: "Sara Mozilla", assets: 49, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Manu", email: "spanishfumeteo", browser: "Sara WaterFox", assets: 31, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Sarush", email: "rockitmgc", browser: "Sara Brave", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "assets" },
{ user: "Maria Elena", email: "epiclysimple", browser: "MacM Brave", assets: 52, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Maryu", email: "mgf.4992", browser: "Aurora Opera", assets: 277, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Pana", email: "ppsymmetry", browser: "Aurora Avast", assets: 250, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Diego", email: "diegocampos76", browser: "Aurora Firefox", assets: 255, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Sacha", email: "sacha.lombard94", browser: "Piedra Brave", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "code" },
{ user: "Charlotte", email: "duboischarlotte34", browser: "Piedra Chrome", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "code" },
{ user: "Soto", email: "sotoj7616", browser: "Piedra Edge", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "code" },
{ user: "Sacha2", email: "NA", browser: "Piedra", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "code" },
{ user: "Emi", email: "emichinito73", browser: "Kai Avast", assets: 22, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Quico", email: "quicosureda", browser: "Kai DuckDuck", assets: 371, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Nancy", email: "nancysureda74", browser: "AlienB Chrome", assets: 365, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "forward" },
{ user: "Marc Ribas", email: "marcribasm", browser: "AlienB Avast", assets: 268, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Coco", email: "nmendicote", browser: "Kai Brave", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "forward" },
{ user: "Maria Cristina", email: "ilv.umbre", browser: "AlienB Firefox & Alien Firefox", assets: 49, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "AcidVars", email: "acidvarsgestiones", browser: "Alien Opera", assets: 382, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Vikingo", email: "marcos.herreros", browser: "Avast Sara", assets: -1, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "assets" },
{ user: "Pep", email: "pepseguimendez", browser: "Sara DuckDuck", assets: 314, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "forward" },
{ user: "Rayito", email: "theekko", browser: "Sara Chrome", assets: 376, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Maria Andrea", email: "mqcryptofund", browser: "Alien Brave", assets: 59, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Maria Flor", email: "mafloren", browser: "Aurora Chrome", assets: 272, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "forward" },
{ user: "Julieta", email: "ophisto.ilv", browser: "MacR Firefox", assets: 903, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Quico Pujol", email: "quicoso72", browser: "MacR Brave", assets: 224, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Cristina Pujol", email: "titanorsito", browser: "MacR Opera", assets: 292, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Gargufo", email: "chucopabras", browser: "MacR Safari", assets: 43, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Joan", email: "joandlfuente", browser: "MacR Avast", assets: 489, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Anna", email: "scoriox24", browser: "MacR Chrome", assets: 337, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" }, //
{ user: "Pera", email: "phosphorus.nft", browser: "MacK Safari", assets: 304, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "Nat", email: "bonhomme.iglesias", browser: "MacK Firefox", assets: 209, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
{ user: "AcidVars2", email: "illuvarsgestiones", browser: "MacK Brave", assets: 237, open: -1, liquidation: -1, api: "", sec: "", pnl: 0, task: "" },
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
        <Text># topup: {accounts.filter(account => account.assets < 100).length}</Text>
      </Box>
      <Table>
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Browser</Th>
            <Th>PNL</Th>
            <Th>Total assets</Th>
            {/* <Th>Open</Th> */}
            {/* <Th>Liquidation</Th> */}
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
              {/* <Td>{account.open}</Td> */}
              {/* <Td>{account.liquidation}</Td> */}
              <Td>{account.task}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}