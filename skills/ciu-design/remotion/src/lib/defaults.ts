/** Studio opens with no input props: show the sample. With --props, Remotion shallow-merges defaultProps under the input, so the sample must be empty or omitted fields would be filled from it. */
export const sampleUnlessInput = <T extends Record<string, unknown>>(sample: T, input: Record<string, unknown>): T | Record<string, never> => (Object.keys(input).length ? {} : sample);
