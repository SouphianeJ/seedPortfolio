import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { JsonSchema, UISchemaElement } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

import DataTable, { Column } from "./components/DataTable";
import {
  emptyExpertise,
  emptyJob,
  emptyProject,
  expertiseSeeds,
  jobSeeds,
  projectSeeds,
} from "./data/seeds";
import expertisesSchema from "./schemas/expertises.schema";
import expertisesUiSchema from "./schemas/expertises.uischema";
import jobpositionsSchema from "./schemas/jobpositions.schema";
import jobpositionsUiSchema from "./schemas/jobpositions.uischema";
import projectsSchema from "./schemas/projects.schema";
import projectsUiSchema from "./schemas/projects.uischema";
import {
  ExpertiseRecord,
  JobRecord,
  ProjectRecord,
  ResourceKey,
  ResourceRecord,
} from "./types";

type ResourceConfig = {
  key: ResourceKey;
  schema: JsonSchema;
  uischema: UISchemaElement;
  description: string;
  columns: Column[];
  createEmpty: () => ResourceRecord;
};

const resourceLabels: Record<ResourceKey, string> = {
  projects: "Projets",
  expertises: "Expertises",
  jobs: "Postes",
};

type ResourceState = Record<ResourceKey, ResourceRecord[]>;

const resourceConfigs: Record<ResourceKey, ResourceConfig> = {
  projects: {
    key: "projects",
    schema: projectsSchema,
    uischema: projectsUiSchema,
    description:
      "Créez et mettez à jour les projets présentés sur votre portfolio en décrivant leurs métadonnées clés.",
    columns: [
      { key: "projectName", label: "Nom" },
      { key: "year", label: "Année" },
      {
        key: "roles",
        label: "Rôles",
        render: (row) => {
          const record = row as ProjectRecord;
          return record.roles && record.roles.length > 0 ? record.roles.join(", ") : "—";
        },
      },
    ],
    createEmpty: emptyProject,
  },
  expertises: {
    key: "expertises",
    schema: expertisesSchema,
    uischema: expertisesUiSchema,
    description:
      "Référencez vos expertises principales, leur niveau et la date de dernière utilisation.",
    columns: [
      { key: "expertiseName", label: "Expertise" },
      { key: "category", label: "Catégorie" },
      { key: "level", label: "Niveau" },
      { key: "lastUsed", label: "Dernière utilisation" },
    ],
    createEmpty: emptyExpertise,
  },
  jobs: {
    key: "jobs",
    schema: jobpositionsSchema,
    uischema: jobpositionsUiSchema,
    description:
      "Définissez vos postes types et associez-leur compétences et projets pertinents.",
    columns: [
      { key: "positionName", label: "Intitulé" },
      { key: "subtitle", label: "Sous-titre" },
      {
        key: "projects",
        label: "Projets associés",
        render: (row) => (row as JobRecord).projects?.length ?? 0,
      },
    ],
    createEmpty: emptyJob,
  },
};

const resourceConfigList = Object.values(resourceConfigs);

type JsonFormsError = {
  message?: string;
  instancePath?: string;
  dataPath?: string;
};

const errorsToMessage = (errors: JsonFormsError[] | undefined) => {
  if (!errors || errors.length === 0) {
    return null;
  }
  const [first] = errors;
  const path = first.instancePath ?? first.dataPath ?? "";
  const normalized = typeof path === "string" ? path.replace(/^\//, "") : "";
  const prefix = normalized ? `${normalized} : ` : "";
  return `${prefix}${first.message ?? "Champ invalide"}`;
};

function useResourceState(initial: ResourceState) {
  const [records, setRecords] = useState(initial);

  const updateResource = <K extends ResourceKey>(
    key: K,
    updater: (previous: ResourceState[K]) => ResourceState[K],
  ) => {
    setRecords((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  };

  const resetResource = <K extends ResourceKey>(key: K) => {
    updateResource(key, () => initial[key].map((item) => ({ ...item })) as ResourceState[K]);
  };

  return { records, updateResource, resetResource } as const;
}

type ResourceViewProps = {
  config: ResourceConfig;
  data: ResourceRecord[];
  onChange: (value: ResourceRecord[]) => void;
};

const ResourceView = ({ config, data, onChange }: ResourceViewProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResourceRecord>(config.createEmpty());
  const [formErrors, setFormErrors] = useState<JsonFormsError[] | undefined>([]);

  const handleResetForm = () => {
    setSelectedId(null);
    setFormData(config.createEmpty());
    setFormErrors([]);
  };

  const handleSelect = (id: string) => {
    const record = data.find((item) => item.id === id);
    if (!record) return;
    setSelectedId(id);
    setFormData(record);
    setFormErrors([]);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
    if (selectedId === id) {
      handleResetForm();
    }
  };

  const handleSave = () => {
    const message = errorsToMessage(formErrors);
    if (message) {
      return;
    }

    const nextId = selectedId ?? crypto.randomUUID();
    const sanitized = { ...formData, id: nextId };

    if (selectedId) {
      onChange(data.map((item) => (item.id === nextId ? sanitized : item)));
    } else {
      onChange([...data, sanitized]);
    }

    handleSelect(nextId);
  };

  const handleDuplicate = () => {
    const base = data.find((item) => item.id === selectedId);
    if (!base) return;
    const duplicate = { ...base, id: crypto.randomUUID() };
    if (config.key === "projects" && "projectName" in duplicate) {
      duplicate.projectName = `${duplicate.projectName} (copie)`;
    }
    onChange([...data, duplicate]);
    handleSelect(duplicate.id);
  };

  const errorMessage = errorsToMessage(formErrors);

  return (
    <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={4}>
      <Box>
        <Typography variant="h6" gutterBottom>
          {resourceLabels[config.key]}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {config.description}
        </Typography>
        <DataTable
          columns={config.columns}
          rows={data}
          selectedId={selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </Box>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            {selectedId ? "Modifier l'entrée" : "Nouvelle entrée"}
          </Typography>
          <Box display="flex" gap={1}>
            <Button variant="outlined" onClick={handleResetForm}>
              Nouveau
            </Button>
            {selectedId && (
              <Button variant="outlined" onClick={handleDuplicate}>
                Dupliquer
              </Button>
            )}
            <Button variant="contained" onClick={handleSave}>
              Enregistrer
            </Button>
          </Box>
        </Box>
        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <JsonForms
          schema={config.schema}
          uischema={config.uischema}
          data={formData}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data: nextData, errors }) => {
            setFormData(nextData as ResourceRecord);
            setFormErrors(errors);
          }}
        />
      </Box>
    </Box>
  );
};

const App = () => {
  const initialState = useMemo<ResourceState>(
    () => ({
      projects: projectSeeds.map((item) => ({ ...item })),
      expertises: expertiseSeeds.map((item) => ({ ...item })),
      jobs: jobSeeds.map((item) => ({ ...item })),
    }),
    [],
  );

  const { records, updateResource, resetResource } = useResourceState(initialState);
  const [tab, setTab] = useState<ResourceKey>("projects");

  const currentConfig = resourceConfigs[tab];
  const tableData = records[tab];

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Seed Portfolio Admin
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => resetResource(tab)}
            aria-label="réinitialiser"
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
        >
          {resourceConfigList.map((config) => (
            <Tab key={config.key} label={resourceLabels[config.key]} value={config.key} />
          ))}
        </Tabs>

        <Box mt={4}>
          <ResourceView
            key={currentConfig.key}
            config={currentConfig}
            data={tableData}
            onChange={(next) => updateResource(currentConfig.key, () => next)}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default App;
