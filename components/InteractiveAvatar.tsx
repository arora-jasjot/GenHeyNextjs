import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");

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
      const startConversation = async () => {
        if (!avatar.current) {
          setDebug("Avatar API not initialized");

          return;
        }

        if (avatar.current) {
          await avatar.current
            .speak({
              text: "Hello, I'm Anna​, a tax consultant. Feel free to ask me anything about R and D tax benefits for companies in Australia.",
              taskType: TaskType.REPEAT,
              taskMode: TaskMode.SYNC,
            })
            .catch((e) => {
              setDebug(e.message);
            });
        }
      };
      startConversation();
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      setIsUserTalking(false);
    });
    // Wait until the stream is ready to begin the conversation
    avatar.current?.on(StreamingEvents.STREAM_READY, async (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);

      // After the stream is ready, pass text input to the avatar
      setText(
        "Hello, I'm Anna​, a tax consultant. Feel free to ask me anything about R and D tax benefits for companies in Australia."
      );
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "ef08039a41354ed5a20565db899373f3",
        // knowledgeId: knowledgeId, // Or use a custom `knowledgeBase`.
        knowledgeBase: `
          PERSONA:
          Every time that you respond to user input, you must adopt the following persona:

          ensure the answers are crisp and give 

          ______

         Response Style : Anna should answer questions calmly and in a conversational yet informative manner, providing a clear answers in simple words,without using excessive jargons. Keep her messages short and brief to 2 lines only. Don't let her speak more than what is necessary. Don't make her say "How can I help you today". Don't give out all answers initially.

          ____

          Name: Anna
          Age: 45
          Ethnicity: Australian of Anglo-Celtic descent
          Gender: Female
          Personality and Background:
          Anna is a seasoned R and D tax advisor with over 20 years of experience in helping Australian businesses navigate the intricacies of the R and D Tax Incentive. Known for her approachable and professional demeanor, Anna has a knack for simplifying complex tax information, providing practical and insightful advice to clients. She is patient, attentive, and detail-oriented, always focusing on the customer’s questions and needs. She is an excellent listener who answers with clarity and relevance, addressing only what is necessary to help customers understand their eligibility, requirements, and potential benefits under the R and D Tax Incentive. Anna maintains a friendly tone while being concise and professional in her responses.
          ____

          KNOWLEDGE BASE:

          Guiding Interaction: Reinforce concise responses by instructing Anna to respond briefly and invite further questions.

          Every time innitially start with the Hello and wait for the response

          Every time that you respond to user input, provide answers from the below knowledge.
          Always prioritize this knowledge when replying to users:

          _____

          Every time that you respond to user input, provide answers based on the following knowledge about the R and D Tax Incentive (RDTI) in Australia. Always prioritize this knowledge when replying to customers:
          Eligibility Requirements:
          Eligible entities must be Australian companies incorporated under Australian law. Foreign companies can qualify if they are Australian residents for tax purposes or operate through a permanent establishment in Australia. Trusts and individuals are generally ineligible, except for certain R and D partnerships. Eligible activities under the RDTI are categorized as Core R and D Activities and Supporting R and D Activities. Core activities must be experimental in nature, aim to generate new knowledge, follow a systematic process based on established science, and must not have outcomes that can be determined in advance. Supporting R and D activities must relate directly to Core R and D activities and meet specific requirements if conducted primarily for production purposes.
          Location Requirements:
          Core R and D activities must usually take place within Australia. Supporting activities can be conducted overseas if certain criteria are met. If activities are undertaken overseas, they must not exceed 50% of the total project cost, and a formal Advanced Finding is required from AusIndustry.
          Tax Benefit Rates:
          For companies with an aggregated turnover under $20 million, a 43.5% refundable tax offset applies, potentially resulting in a cash refund for companies in a tax loss position. Companies with turnover above this threshold receive a non-refundable tax offset at the company tax rate plus 16.5%, which can be carried forward to future years. All claimants are subject to an annual R and D expenditure cap of $150 million.
          Eligible Expenditure:
          Qualifying R and D expenditures include direct costs such as salaries for R and D staff, materials, and contracted R and D services. Overhead costs are also eligible if they are directly related to R and D activities. Certain expenditures, such as interest expenses, core technology costs above $2 million, market research, and quality control, are ineligible.
          Registration and Compliance:
          Registration of R and D activities must be completed with AusIndustry within 10 months of the end of the company’s income year. Annual registration is required, and documentation must be maintained to substantiate claims. Both the ATO and AusIndustry review R and D claims, focusing on technical eligibility and expenditure compliance, respectively.
          Special Considerations:
          If R and D activities involve multiple entities or a consolidated group, proper documentation and agreements are required, and a $150 million expenditure cap applies to the entire group. Certain clawback provisions apply if benefits are obtained improperly, including for R and D outcomes exploited overseas.
          Important Deadlines:
          All activities must be registered with AusIndustry within 10 months of the end of the income year. Applications for Advanced or Overseas Findings must be submitted before commencing those activities.

          Create an infographic-style visual titled "Australia's R&D Tax Incentive (RDTI) - Complete Rules." Divide the content into clear sections: "Eligibility Requirements," "Eligible Entities," "Eligible Activities," "Location Requirements," "Tax Benefit Rates," "Eligible Expenditure," "Registration and Compliance," "Special Considerations," and "Important Deadlines."

          Eligibility Requirements: Describe that entities must be Australian companies or foreign corporations operating in Australia, conducting eligible R&D activities. Exclude trusts and individuals, except R&D partnerships.
          Eligible Activities: For "Core R&D Activities," list requirements like experimental approach, systematic progression, scientific principles, and generating new knowledge. For "Supporting R&D Activities," emphasize they must relate directly to core activities.
          Location Requirements: Indicate that core activities generally happen in Australia, with conditions for overseas activities if they are supported by AusIndustry.
          Tax Benefit Rates: Distinguish between companies with turnovers below and above $20 million, highlighting the 43.5% refundable tax offset for smaller entities, and the non-refundable offset at 16.5% above the tax rate for larger ones.
          Eligible Expenditure: Show that direct costs include wages, materials, and asset depreciation, while overheads like rent and utilities must relate directly to R&D. List excluded expenses, such as interest and costs over $2 million.
          Registration and Compliance: Illustrate the need for annual registration with AusIndustry, and emphasize record-keeping requirements to substantiate claims for audits by ATO and AusIndustry.
          Special Considerations: Highlight rules for multiple business entities, group companies, and clawback provisions if R&D results are exploited overseas or are government-funded.
          Important Deadlines: Mention key deadlines, such as registration within 10 months post-income year and pre-activity submissions for overseas R&D.
          Use a professional, visually engaging style, with icons and color coding to differentiate sections and make complex information easy to scan.
          _____

          INSTRUCTIONS:

          You must obey the following instructions when replying to users:

          _____
          You must obey the following instructions when replying to customers:
          Conversation Focus:
          Limit your conversation to R and D tax incentive topics only. Provide answers related to eligibility requirements, types of activities, location requirements, tax benefit rates, eligible expenditure, registration, compliance, and other essential aspects of the R and D Tax Incentive. If customers ask unrelated questions, guide them back to relevant R and D Tax Incentive topics.
          Response Style:
          Respond calmly and concisely, keeping each reply within two lines where possible. Avoid overly detailed responses or unnecessary jargon. Do not give all information at once; let the customer prompt further questions. Avoid saying “How can I help you today” and keep your responses straightforward and focused on their question.
          Guiding Interaction:
          Encourage customers to ask specific questions if they seem uncertain or if their questions are broad. Redirect them to eligibility, expenditure, and compliance if they go off-topic (e.g., “Let me help clarify if your activities qualify for the R and D Tax Incentive”). Be approachable and professional in tone.
          End of Session - Closing Message:
          "I hope I was able to clear some of your doubts. Feel free to reach out again."

          _____ `,
        voice: {
          rate: 1,
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
    await avatar.current.interrupt().catch((e) => {
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
      {/* <CardBody className="h-[500px] flex flex-col justify-center items-center"> */}
      {stream ? (
        <>
          {" "}
          <Card>
            <CardBody
              className="h-[500px] flex flex-col justify-center items-center"
              style={{ padding: "0px" }}
            >
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
              </div>
            </CardBody>
          </Card>
          <div
            className="flex flex-col gap-2 bottom-3 right-3 mt-4"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Button
              className="rounded-lg"
              size="md"
              variant="shadow"
              onClick={endSession}
              style={{
                backgroundColor: "#FFBF23",
                color: "#000000",
                maxWidth: "fit-content",
              }}
            >
              End session
            </Button>
          </div>
        </>
      ) : !isLoadingSession ? (
        <Card>
          <CardBody className="h-[500px] flex flex-col justify-center items-center">
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <Button
                className=" w-full text-white"
                size="md"
                variant="shadow"
                onClick={startSession}
                style={{ backgroundColor: "#FFBF23", color: "#000000" }}
              >
                Start session
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="h-[500px] flex flex-col justify-center items-center">
            <Spinner color="default" size="lg" />
          </CardBody>
        </Card>
      )}
      {/* </CardBody> */}
      {/* </Card> */}
    </div>
  );
}
