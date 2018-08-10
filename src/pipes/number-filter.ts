import { Pipe, PipeTransform } from "@angular/core";

/**
 * Generated class for the RiseOrFall pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
    name: "numberFilter",
})
export class NumberFilterPipe implements PipeTransform {
    /**
     * Takes a value and makes it lowercase.
     */
    transform(value: any, retainZero: boolean = false): number | string {
        if (value === undefined || value === null || Object.is(value, NaN)) {
            return "--";
        } else if (typeof value === "string" && /%$/.test(value)) {
            if (parseFloat(value) === 0 && !retainZero) {
                return "--";
            } else {
                return value;
            }
        } else if (
            (value === 0 ||
                (typeof value === "string" && value.length && +value === 0)) &&
            retainZero
        ) {
            return 0;
        } else if (!value || isNaN(value) || parseFloat(value) === 0) {
            return "--";
        } else {
            return value;
        }
    }
}
