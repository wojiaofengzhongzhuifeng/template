import { ABC, STEP_LENGTH } from './consts';

export const path_from_depth = ({ path, depth }: { path: string; depth: number }) =>
    path.slice(0, depth * STEP_LENGTH);

export const str2int = (str: string) => Number.parseInt(str, ABC.length);

export const int2str = (int: number) =>
    Number(int)
        .toString(ABC.length)
        .padStart(STEP_LENGTH, ABC.at(0) ?? '0')
        .toUpperCase();

export const increment_path = (path: string) => {
    const parent_path = path.slice(0, path.length - STEP_LENGTH);
    const step_int = str2int(path.slice(-STEP_LENGTH));
    const new_step = int2str(step_int + 1);

    if (new_step.length > STEP_LENGTH) {
        throw new Error(`Path "${new_step}" is overflowing step boundaries`);
    }

    const new_path = parent_path + new_step;
    return new_path;
};

export const last_position_in_path = ({ path }: { path: string }) =>
    str2int(path.slice(-STEP_LENGTH));
