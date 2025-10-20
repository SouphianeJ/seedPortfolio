import { useMemo, useState } from 'react';
import {
  Container,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { JsonForms } from '@jsonforms/react';
import { materialCells, materialRenderers } from '@jsonforms/material-renderers';
import type { JsonFormsCore } from '@jsonforms/core';

import { initialData } from './schemas/data';
import { personSchema } from './schemas/jsonSchema';
import { personUiSchema } from './schemas/uiSchema';

function App() {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<JsonFormsCore['errors']>([]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#1565c0',
          },
          secondary: {
            main: '#00897b',
          },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h3" component="h1">
                JSON Forms React Seed
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This example uses the Material renderers from the Eclipse JSON Forms
                project. Modify the JSON schema or the UI schema to reshape the
                generated form instantly.
              </Typography>
            </Stack>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <JsonForms
                schema={personSchema}
                uischema={personUiSchema}
                data={data}
                renderers={materialRenderers}
                cells={materialCells}
                onChange={({ data: updatedData, errors: validationErrors }) => {
                  setData(updatedData);
                  setErrors(validationErrors ?? []);
                }}
              />
            </Paper>
            <Stack spacing={2}>
              <div>
                <Typography variant="h5" component="h2" gutterBottom>
                  Bound data
                </Typography>
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
              <div>
                <Typography variant="h5" component="h2" gutterBottom>
                  Validation errors
                </Typography>
                <pre>{JSON.stringify(errors, null, 2)}</pre>
              </div>
            </Stack>
          </Stack>
        </Container>
      </main>
    </ThemeProvider>
  );
}

export default App;
