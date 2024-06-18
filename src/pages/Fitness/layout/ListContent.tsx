import { 
    Avatar, ListItem, ListItemText, 
    ListItemIcon,ListItemButton
} from '@mui/material';

import { useFitnessStore } from '../../../store';
import mockJson from '../api/nutritionixSingleItemMock.json';


const ListContent = ({ data }: { data: any }) => {
    const fitnessStore = useFitnessStore();

    const handleSelected = async (food: any) => {
        const isFoodList = data?.branded;
        let result = isFoodList ? mockJson.foods[0] : food;

        fitnessStore.setSelectedSearchItem(result);
        fitnessStore.toggleDrawer({ open: false, anchor: "bottom" });

        setTimeout(() => fitnessStore.toggleDrawer({ open: true, anchor: "right" }), 250);
    };

    return data.branded 
        ? data.branded.map((food: any, index: number) => (
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
        )) : data.map((exercise: any, index: number) => (
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
