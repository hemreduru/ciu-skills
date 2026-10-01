import type { FC } from "react";
import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import "./fonts";
import { FPS } from "./brand";
import { Branded, brandedSeconds } from "./compositions/Branded";
import { Motion, motionSeconds } from "./compositions/Motion";
import { Post } from "./compositions/Post";
import { resolveSize } from "./lib/rules";
import { sampleBranded, sampleMotion, samplePost } from "./samples";
import type { PostProps } from "./schema";

const stillMeta: CalculateMetadataFunction<PostProps> = ({ props }) => resolveSize(props.size);

const videoMeta =
  <T extends Record<string, unknown> & { size: string }>(seconds: (p: T) => number): CalculateMetadataFunction<T> =>
  ({ props }) => ({ ...resolveSize(props.size), durationInFrames: Math.max(1, Math.round(seconds(props) * FPS)) });

export const RemotionRoot: FC = () => (
  <>
    <Still id="Post" component={Post} defaultProps={samplePost} calculateMetadata={stillMeta} />
    <Composition id="Motion" component={Motion} fps={FPS} defaultProps={sampleMotion} calculateMetadata={videoMeta(motionSeconds)} />
    <Composition id="Branded" component={Branded} fps={FPS} defaultProps={sampleBranded} calculateMetadata={videoMeta(brandedSeconds)} />
  </>
);
