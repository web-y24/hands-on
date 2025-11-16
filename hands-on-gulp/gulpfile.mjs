import { series } from "gulp";

export function noop(done){ done(); }

export default series(noop);
