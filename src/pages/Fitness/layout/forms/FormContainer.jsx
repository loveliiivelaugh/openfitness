import React from 'react';
import { 
    Box, Button, Grid, TextField, Typography, 
} from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import moment from 'moment';

import { useFitnessStore } from '../../store';
import { fitnessQueries } from '../../api';



const mapDefaultValue = (column, fitnessStore) => {
    const profile = fitnessStore.fitnessTables?.profile[0];
    // console.log("mapDefaultValue: ", column, profile);

    switch (column) {
        // Profile Default Values
        case "age":
            return profile?.age;
        case "height":
            return profile?.height;
        case "weight":
            return profile?.weight || 0;
        case "goal":
            return (profile?.goal === 0 ? "Maintain" : "Lose");
        case "exercise":
            return (profile?.exercise === 1.55 ? "Very Active" : "Not Active");
        case "tdee":
            return profile?.tdee || 0;
        case "bmr":
            return profile?.bmr || 0;
            
        // Exercise Search Default Values
        case "reps":
            return 10;
        case "sets":
            return 3;
        case "muscle":
            return (fitnessStore.selectedSearchItem?.muscle || "");
        case "difficulty":
            return (fitnessStore.selectedSearchItem?.difficulty || "");
        case "equipment":
            return (fitnessStore.selectedSearchItem?.equipment || "");
        case "instructions":
            return (fitnessStore.selectedSearchItem?.instructions || "");
        case "type":
            return (fitnessStore.selectedSearchItem?.type || "");

        // Food Search Default Values
        case "name":
            return (fitnessStore.selectedSearchItem?.food_name || fitnessStore.selectedSearchItem?.name || "");
        case "date":
            return moment().format("ddd, MMMM DD, YYYY");
        case "time":
            return moment().format("h:mm a");
        case "calories":
            return (fitnessStore.selectedSearchItem?.nf_calories || 0);
        case "serving_size":
            return 1;
        case "num_servings":
            return 1;
        case "user_id":
            return 1;
        case "meal":
            let meal = "Snack";
            // Check time of day and assign meal accordingly
            const currentHour = new Date().getHours();
            if (currentHour >= 6 && currentHour < 12) {
                meal = "Breakfast";
            }
            if (currentHour >= 12 && currentHour < 18) {
                meal = "Lunch";
            }
            if (currentHour >= 18 && currentHour < 22) {
                meal = "Dinner";
            }
            return meal;
        case "nutrients":
            return fitnessStore.selectedSearchItem || {};
        default:
            return "";
    };
};


const Attachment = () => (
    <Box sx={{}}>
      <Typography id="demo-simple-select-label" variant="body1">
        Progress Photo
      </Typography>
      <IconButton p={1}>
        <AttachmentIcon />
        <attachment />
      </IconButton>
    </Box>
);
  
const SelectWrapper = (props) => (
    <Select {...props}>
      {props.options && props.options
        .map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.label}
          </MenuItem>
      ))}
    </Select>
);


const buildFields = (fieldsObject, formState) => fieldsObject
    .map((field) => {

        // Define common properties for all fields
        const commonProperties = {
            key: field.name,
            id: field.name,
            ...field,
            fullWidth: true
        };

        // Define properties specific to the field type
        const FieldsProps = {
            TextField: {...commonProperties },
            Select: {
                ...commonProperties,
                options: [],
                SelectProps: {
                    native: true,
                },
            },
            Date: {
                ...commonProperties,
                // value: new Date(field.value).toLocaleDateString(),
                // placeholder: new Date().toLocaleDateString(),
            },
            Time: {
                ...commonProperties,
                // value: new Date(field.value).toLocaleTimeString(),
                // placeholder: new Date().toLocaleTimeString(),
            },
            Json: {
                ...commonProperties,
                value: JSON.stringify(field.value),
                type: "text",
                multiline: true,
                minRows: 4,
            },
        };

        return ({
            text: <TextField {...FieldsProps.TextField} />,
            number: <TextField {...FieldsProps.TextField} />,
            // date: <BasicDatePicker {...FieldsProps.Date} />,
            // time: <BasicTimePicker {...FieldsProps.Time} />,
            select: <SelectWrapper {...FieldsProps.Select} />,
            json: <TextField {...FieldsProps.Json} />,
            attachment: <Attachment />,
        }[field.type])
    });

const excludedColumns = [
    "id",
    "created_at",
    "updated_at",
    "user_id",
    "nutrients"
];

const FormContainer = ({ schema, fitnessTablesQuery }) => {
    const fitnessStore = useFitnessStore();
    const fieldsQuery = useQuery(fitnessQueries.readTableQuery(schema));
    const mutateDbQuery = useMutation(fitnessQueries.writeTableQuery());

    const form = useForm({
        defaultValues: Object.assign(
            {}, 
            ...schema.columns
                .map((column) => ({ 
                    [column]: mapDefaultValue(column, fitnessStore) 
                }))),
        onSubmit: async (values) => {
            console.log("values: ", values)

            const findHighestId = () => {
                let highestId = 0;
                fitnessStore.fitnessTables[schema.table]
                    .forEach((row) => {
                        if (row.id > highestId) {
                            highestId = row.id;
                        }
                    });
                return highestId;
            };

            // TODO: Need to Fix these date/time formatting for db
            delete values.value.date;
            delete values.value.time;
            delete values.value.created_at;

            let payload = {
                table: schema.table,
                data: {
                    ...values.value,
                    id: (parseInt(findHighestId()) + 1),
                    user_id: fitnessStore.userID
                }
            };

            await mutateDbQuery.mutate(payload);

            await fitnessTablesQuery.refetch();
        },
    });
   
    const handleCancelClick = () => {
        form.reset(); 
        fitnessStore.toggleDrawer();
    };

    const handleSubmit = () => {
        form.handleSubmit();
        fitnessStore.toggleDrawer({ open: false, anchor: "right" });
    };

    return (
        <Grid container component={form.Form} p={2} rowSpacing={2}>
            
            <Grid item sm={12}>
                <Typography variant="h5">
                    Log {schema.table}
                </Typography>
            </Grid>

            {buildFields(
                schema.columns
                    .filter(column => !excludedColumns.includes(column))
                    .map(column => ({ 
                        name: column,
                        label: column,
                        type: "text", 
                        value: "" 
                    })),
                form
            ).map(Field => (
                <Grid item sm={12}>
                    <form.Field name={Field.props.name}>
                        {(field) => (
                            <>
                                {React.cloneElement(Field, {
                                    ...field, 
                                    defaultValue: field.state.value,
                                    onChange: (event) => field.handleChange(event.target.value),
                                    onBlur: field.handleBlur,
                                    value: field.state.value
                                })}
                                {/* <FieldInfo field={field} /> */}
                            </>
                        )}
                    </form.Field>
                </Grid>
            ))}

            <Grid item sm={12}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Button variant="outlined" color="error" onClick={handleCancelClick} fullWidth>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Grid>

        </Grid>
    )
};

export default FormContainer
