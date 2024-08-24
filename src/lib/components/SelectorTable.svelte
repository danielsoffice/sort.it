<script lang="ts">
    import TypeSelector from "./Controls/TypeSelector.svelte";
    import Svg from "./SVG.svelte";

    export let titles: string[];
    export let data: string[][];

    let filters: string[] = [];

    function filterTable(
        filters: string[],
    ): [string[], string[][], string[][]] {
        const fTitles = structuredClone(titles);
        const fData = structuredClone(data);

        for (let i = 0; i < filters.length; i++) {
            if (filters[i] === "") continue;

            // remove rows that don't match filter
            for (let k = 0; k < fData.length; k++) {
                fData[k] = fData[k].filter(
                    (_val: string, index: number) =>
                        fData[i][index] === filters[i],
                );
            }
        }

        // for (let i = 0; i < filters.length; i++) {
        //     if (filters[i] === "") continue;

        //     fTitles.splice(i, 1);
        //     fData.splice(i, 1);
        // }

        let fcolumnValues: string[][] = [];
        data.forEach((column: string[]) => {
            let uniqueValues: string[] = [];
            column.forEach((data: string | number) => {
                if (!uniqueValues.includes(data as string))
                    uniqueValues.push(data as string);
            });
            fcolumnValues.push(uniqueValues);
            filters.push("");
        });

        return [fTitles, fData, fcolumnValues];
    }

    function optionSelected(value: string, i: number) {
        filters[i] = value === filteredTitles[i] ? "" : value;
    }
    const createSelectFunction = (i: number) => (value: string) =>
        optionSelected(value, i);

    $: [filteredTitles, filteredData, filteredColumnValues] =
        filterTable(filters);
</script>

<table>
    <tr>
        <th>&nbsp;</th>

        {#each titles as title, i}
            <th
                ><TypeSelector
                    changeTypeEvent={createSelectFunction(i)}
                    holds={[title, ...filteredColumnValues[i]]}
                    initVal={title}
                /></th
            >
        {/each}
    </tr>
    {#each filteredData[0] as _dataRow, rowIndex}
        <tr>
            <td>core.box</td>
            {#each filteredData as dataColumn}
                <td>
                    {dataColumn[rowIndex]}
                </td>
            {/each}
        </tr>
    {/each}
</table>

<style>
    table {
        /* outline: none; */
        border-radius: 5px;
        background: var(--box-color);
        color: var(--box-control-color);
    }
    th {
        padding: 2px 5px 5px 5px;
        border-bottom: 1px solid rgba(var(--detail-contrast), 0.5);
    }
    td:nth-child(even) {
        background: rgba(var(--detail-contrast), 0.03);
    }
    tr:nth-child(even) {
        background: rgba(var(--detail-contrast), 0.03);
    }
    td {
        padding: 2px 5px;
    }
    td:first-child {
        padding-right: 12px;
    }
</style>
