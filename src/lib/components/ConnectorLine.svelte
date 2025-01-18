<script lang="ts">
    import {onDestroy, onMount} from "svelte";

    export let element1: HTMLElement;
    export let element2: HTMLElement;


    onMount(()=>{
        connect(
            element1,
            element2,
            "var(--item-text-color)",
            1
        );
    })

    function getOffset( el ) {
        let rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    }

    let htmlLine;
    let upLine1;
    let upLine2;

    function connect(div1, div2, color, thickness) { // draw a line connecting elements
        let off1 = getOffset(div1);
        let off2 = getOffset(div2);
        // bottom right
        let x1 = off1.left + off1.width / 2;
        let y1 = off1.top;
        // top right
        let x2 = off2.left + off2.width / 2;
        let y2 = off2.top;
        // distance
        let length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
        // center
        let cx = ((x1 + x2) / 2) - (length / 2);
        let cy = ((y1 + y2) / 2) - (thickness / 2);
        // angle
        let angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);

        let up1x = x1 - 8;
        let up2x = x2 - 8;
        // make hr

        htmlLine = document.createElement("div");
        htmlLine.style = "height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + (cy - 15) + "px; width:" + length + "px; transform:rotate(" + angle + "deg);";

        upLine1 = document.createElement("div");
        upLine1.style = "height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + up1x + "px; top:" + (y1 - 8) + "px; width:15px; transform:rotate(90deg);";

        upLine2 = document.createElement("div");
        upLine2.style = "height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + up2x + "px; top:" + (y2 - 8) + "px; width:15px; transform:rotate(90deg);";

        element2.style = "border: 1px solid var(--item-text-color) !important;"
        document.body.appendChild(htmlLine);
        document.body.appendChild(upLine1);
        document.body.appendChild(upLine2);
    }

    onDestroy(()=>{
        element2.style = ""
        htmlLine.remove();
        upLine1.remove();
        upLine2.remove();
    })
</script>