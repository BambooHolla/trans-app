import { Pipe, PipeTransform } from "@angular/core";

/**
 * Generated class for the RiseOrFall pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
    name: "positiveSign",
})
export class PositiveSignPipe implements PipeTransform {
    /**
     * Takes a value and makes it lowercase.
     */
    transform(value: string): string {
        if (value && !value.startsWith("-") && /[^0.%]/.test(value)) {
            return "+" + value;
        } else {
            return value;
        }
    }
}
