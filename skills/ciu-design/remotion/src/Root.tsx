import type { FC } from "react";
import { Composition, Still, getInputProps, type CalculateMetadataFunction } from "remotion";
import "./fonts";
import { FPS } from "./brand";
import { Branded, brandedSeconds } from "./compositions/Branded";
import { Motion, motionSeconds } from "./compositions/Motion";
import { Post } from "./compositions/Post";
import * as customStills from "./custom/stills";
import * as customVideos from "./custom/videos";
import { sampleUnlessInput } from "./lib/defaults";
import { resolveSize } from "./lib/rules";
import { sampleBranded, sampleCustom, sampleMotion, samplePost } from "./samples";
import type { CustomProps, PostProps } from "./schema";

const stillMeta = <T extends Record<string, unknown> & { size: string }>(): CalculateMetadataFunction<T> => ({ props }) => resolveSize(props.size);

const videoMeta =
  <T extends Record<string, unknown> & { size: string }>(seconds: (p: T) => number): CalculateMetadataFunction<T> =>
  ({ props }) => ({ ...resolveSize(props.size), durationInFrames: Math.max(1, Math.round(seconds(props) * FPS)) });

const input = getInputProps();
const d = <T extends Record<string, unknown>>(sample: T) => sampleUnlessInput(sample, input) as T;

export const RemotionRoot: FC = () => (
  <>
    <Still id="Post" component={Post} defaultProps={d(samplePost)} calculateMetadata={stillMeta<PostProps>()} />
    <Composition id="Motion" component={Motion} fps={FPS} defaultProps={d(sampleMotion)} calculateMetadata={videoMeta(motionSeconds)} />
    <Composition id="Branded" component={Branded} fps={FPS} defaultProps={d(sampleBranded)} calculateMetadata={videoMeta(brandedSeconds)} />
    {Object.entries(customStills).map(([id, C]) => (
      <Still key={id} id={id} component={C} defaultProps={d(sampleCustom)} calculateMetadata={stillMeta<CustomProps>()} />
    ))}
    {Object.entries(customVideos).map(([id, C]) => (
      <Composition key={id} id={id} component={C} fps={FPS} defaultProps={d(sampleCustom)} calculateMetadata={videoMeta((p: CustomProps) => p.seconds ?? 6)} />
    ))}
  </>
);
