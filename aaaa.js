import React, { useState } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, useLazyQuery, gql } from '@apollo/client';
import { TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Replace with your server URL
  cache: new InMemoryCache(),
});

const GET_TABLE_DATA = gql`
  query GetTableData($filterColumn: String, $filterValue: String) {
    tableData(filterColumn: $filterColumn, filterValue: $filterValue) {
      id
      column1
      column2
      // Add more fields for other columns
    }
  }
`;

const TableComponent = () => {
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [getTableData, { loading, data }] = useLazyQuery(GET_TABLE_DATA);

  const handleApplyFilter = () => {
    getTableData({
      variables: {
        filterColumn: filterColumn,
        filterValue: filterValue,
      },
    });
  };

  return (
    <div>
      <TextField
        label="Column Name"
        value={filterColumn}
        onChange={(e) => setFilterColumn(e.target.value)}
      />
      <TextField
        label="Row Value"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleApplyFilter}>
        Apply Filter
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column 1</TableCell>
            <TableCell>Column 2</TableCell>
            {/* Add more table header cells for each column */}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2}>Loading...</TableCell>
            </TableRow>
          ) : (
            data &&
            data.tableData &&
            data.tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.column1}</TableCell>
                <TableCell>{row.column2}</TableCell>
                {/* Add more table cells for each column */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <TableComponent />
    </ApolloProvider>
  );
};

export default App;










const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2/promise');
const cors = require('cors');

const dbConfig = {
  host: 'your_database_host',
  user: 'your_database_user',
  password: 'your_database_password',
  database: 'your_database_name',
};

const schema = buildSchema(`
  type TableData {
    id: ID!
    column1: String
    column2: String
    // Add more fields for other columns
  }

  type Query {
    tableData(filterColumn: String, filterValue: String): [TableData]
  }
`);

const root = {
  tableData: async ({ filterColumn, filterValue }) => {
    const connection = await mysql.createConnection(dbConfig);

    let query = 'SELECT * FROM your_table_name';
    const params = [];

    if (filterColumn && filterValue) {
      query += ` WHERE ${filterColumn} = ?`;
      params.push(filterValue);
    }

    const [rows] = await connection.execute(query, params);
    connection.end();
    return rows;
  },
};

const app = express();
app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Set to false in production
  })
);

const PORT = 4000; // or any other port you prefer

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});
