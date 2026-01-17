import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface SpecItem {
    parameter: string;
    value: string;
    unit?: string;
}

interface TechnicalSpecTableProps {
    specs: SpecItem[];
    className?: string;
}

export function TechnicalSpecTable({ specs, className }: TechnicalSpecTableProps) {
    return (
        <div className={`w-full overflow-x-auto rounded-md border border-border ${className}`}>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[40%] font-bold text-foreground">Параметр</TableHead>
                        <TableHead className="font-bold text-foreground">Значение</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {specs.map((spec, index) => (
                        <TableRow key={index} className="group hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium text-muted-foreground group-hover:text-foreground">
                                {spec.parameter}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                                {spec.value} {spec.unit && <span className="text-muted-foreground ml-1 text-xs">{spec.unit}</span>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
