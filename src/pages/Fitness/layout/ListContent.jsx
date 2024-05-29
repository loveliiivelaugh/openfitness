import React from 'react';
import axios from 'axios';
import { 
    Avatar, ListItem, ListItemText, 
    ListItemIcon,ListItemButton
} from '@mui/material';

import { useFitnessStore } from '../store';
import mockJson from '../api/nutritionixSingleItemMock.json';


const hostname = import.meta.env.VITE_HOSTNAME;

const ListContent = ({ data }) => {
    const fitnessStore = useFitnessStore();

    const handleSelected = async (food) => {
        console.log("handleSelected: ", food)

        const isFoodList = data?.branded;

        // const result = (await axios.get(`${hostname}/api/foods/get-single-food?id=${food.nix_item_id}`)).data.foods[0];

        // console.log("handleSelected.result: ", result);
        let result = isFoodList ? mockJson.foods[0] : food;

        fitnessStore.setSelectedSearchItem(result);
        fitnessStore.toggleDrawer({ open: false, anchor: "bottom" });
        setTimeout(() => fitnessStore.toggleDrawer({ open: true, anchor: "right" }), 250);
    };

    return data.branded 
        ? data.branded.map((food, index) => (
            <ListItem 
                key={index} 
                sx={{ 
                    borderBottom: 'solid 1px rgba(0,0,0,0.1)', 
                    '&:hover': { 
                        background: "rgba(0,0,0,0.1)",
                        cursor: "pointer"
                    } 
                }}
            >
                <ListItemButton onClick={() => handleSelected(food)}>
                    <ListItemIcon>
                        <Avatar src={food.photo.thumb} />
                    </ListItemIcon>
                    <ListItemText primary={food.brand_name} secondary={`${food.nf_calories} Calories`} />
                </ListItemButton>
            </ListItem>
        )) : data.map((exercise, index) => (
            <ListItem
                key={index}
                sx={{
                    borderBottom: 'solid 1px rgba(0,0,0,0.1)',
                    '&:hover': {
                        background: "rgba(0,0,0,0.1)",
                        cursor: "pointer"
                    }
                }}
            >
                <ListItemButton onClick={() => handleSelected(exercise)}>
                    <ListItemText primary={exercise.name} secondary={`${exercise.instructions}`} />
                </ListItemButton>
            </ListItem>
        ))
}

export default ListContent;
