import {createTheme} from "@material-ui/core/styles";
import {Direction} from "@material-ui/core";
import overrides from "./overrides";
import palette, {shape} from "./palette";
import typography from "./typography";

const t = createTheme({
    palette,
    typography,
    shape,
    props: {
        MuiTab: {
            disableRipple: true,
        },
    },
    mixins: {
        toolbar: {
            minHeight: 48,
        },
    },
})


const Theme = (direction: Direction) => {
    t.direction = direction;
    t.overrides = overrides(t);
    return t;
}

export default Theme;
