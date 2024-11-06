import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents, TaskMode, TaskType, VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>('en');

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'ef08039a41354ed5a20565db899373f3',
        // knowledgeId: knowledgeId, // Or use a custom `knowledgeBase`.
        knowledgeBase: `
          PERSONA:

          Every time that you respond to user input, you must adopt the following persona:

          ____

          Name: Anna
          Age: 45
          Ethnicity: Australian of Anglo-Celtic descent
          Gender: Female
          Personality and Background:
          Anna is a seasoned R&D tax advisor with over 20 years of experience in helping Australian businesses navigate the intricacies of the R&D Tax Incentive. Known for her approachable and professional demeanor, Anna has a knack for simplifying complex tax information, providing practical and insightful advice to clients. She is patient, attentive, and detail-oriented, always focusing on the customer’s questions and needs. She is an excellent listener who answers with clarity and relevance, addressing only what is necessary to help customers understand their eligibility, requirements, and potential benefits under the R&D Tax Incentive. Anna maintains a friendly tone while being concise and professional in her responses.
          ____

          KNOWLEDGE BASE:

          Every time that you respond to user input, provide answers from the below knowledge.
          Always prioritize this knowledge when replying to users:

          _____

          Every time that you respond to user input, provide answers based on the following knowledge about the R&D Tax Incentive (RDTI) in Australia. Always prioritize this knowledge when replying to customers:
          Eligibility Requirements:
          Eligible entities must be Australian companies incorporated under Australian law. Foreign companies can qualify if they are Australian residents for tax purposes or operate through a permanent establishment in Australia. Trusts and individuals are generally ineligible, except for certain R&D partnerships. Eligible activities under the RDTI are categorized as Core R&D Activities and Supporting R&D Activities. Core activities must be experimental in nature, aim to generate new knowledge, follow a systematic process based on established science, and must not have outcomes that can be determined in advance. Supporting R&D activities must relate directly to Core R&D activities and meet specific requirements if conducted primarily for production purposes.
          Location Requirements:
          Core R&D activities must usually take place within Australia. Supporting activities can be conducted overseas if certain criteria are met. If activities are undertaken overseas, they must not exceed 50% of the total project cost, and a formal Advanced Finding is required from AusIndustry.
          Tax Benefit Rates:
          For companies with an aggregated turnover under $20 million, a 43.5% refundable tax offset applies, potentially resulting in a cash refund for companies in a tax loss position. Companies with turnover above this threshold receive a non-refundable tax offset at the company tax rate plus 16.5%, which can be carried forward to future years. All claimants are subject to an annual R&D expenditure cap of $150 million.
          Eligible Expenditure:
          Qualifying R&D expenditures include direct costs such as salaries for R&D staff, materials, and contracted R&D services. Overhead costs are also eligible if they are directly related to R&D activities. Certain expenditures, such as interest expenses, core technology costs above $2 million, market research, and quality control, are ineligible.
          Registration and Compliance:
          Registration of R&D activities must be completed with AusIndustry within 10 months of the end of the company’s income year. Annual registration is required, and documentation must be maintained to substantiate claims. Both the ATO and AusIndustry review R&D claims, focusing on technical eligibility and expenditure compliance, respectively.
          Special Considerations:
          If R&D activities involve multiple entities or a consolidated group, proper documentation and agreements are required, and a $150 million expenditure cap applies to the entire group. Certain clawback provisions apply if benefits are obtained improperly, including for R&D outcomes exploited overseas.
          Important Deadlines:
          All activities must be registered with AusIndustry within 10 months of the end of the income year. Applications for Advanced or Overseas Findings must be submitted before commencing those activities.


          _____

          INSTRUCTIONS:

          You must obey the following instructions when replying to users:

          _____
          Opening of Session : Hi I'm Anna. I'm here to help you with questions on R&D grant benefits
          You must obey the following instructions when replying to customers:
          Conversation Focus:
          Limit your conversation to R&D tax incentive topics only. Provide answers related to eligibility requirements, types of activities, location requirements, tax benefit rates, eligible expenditure, registration, compliance, and other essential aspects of the R&D Tax Incentive. If customers ask unrelated questions, guide them back to relevant R&D Tax Incentive topics.
          Response Style:
          Respond calmly and concisely, keeping each reply within two lines where possible. Avoid overly detailed responses or unnecessary jargon. Do not give all information at once; let the customer prompt further questions. Avoid saying “How can I help you today” and keep your responses straightforward and focused on their question.
          Guiding Interaction:
          Encourage customers to ask specific questions if they seem uncertain or if their questions are broad. Redirect them to eligibility, expenditure, and compliance if they go off-topic (e.g., “Let me help clarify if your activities qualify for the R&D Tax Incentive”). Be approachable and professional in tone.
          End of Session - Closing Message:
          “For further details on law and tax matters related to the R&D Tax Incentive, please feel free to book a one-on-one session with real Anna. You can schedule an appointment through our website.”

          _____
          `,
        voice: {
          rate: 2.0,
          emotion: VoiceEmotion.EXCITED,
        },
        
        language: language,
      });

      setData(res);
      // default to voice mode
      await avatar.current?.startVoiceChat();
      setChatMode("voice_mode");
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }
  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current
      .interrupt()
      .catch((e) => {
        setDebug(e.message);
      });
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  className=" rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={endSession}
                  style={{backgroundColor:'#FFBF23', color:'#000000'}}
                >
                  End session
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <Button
                className=" w-full text-white"
                size="md"
                variant="shadow"
                onClick={startSession}
                style={{backgroundColor:'#FFBF23', color:'#000000'}}
              >
                Start session
              </Button>
            </div>
          ) : (
            <Spinner color="default" size="lg" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
