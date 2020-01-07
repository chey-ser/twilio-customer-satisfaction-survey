exports.handler = async(context, event, callback) =>{
    
    const {CurrentTask} = event;

    //calling task handlers
    switch(CurrentTask){

        case 'greeting' :
            await greetingTaskHandler(context, event, callback);
            break;

        case 'start_survey' :
            await startSurveyTaskHandler(context, event, callback);
            break;

        case 'complete_survey' :
            await completeSurveyTaskHandler(context, event, callback);
            break;

        case 'goodbye' :
            await goodbyeTaskHandler(context, event, callback);
            break;

        case 'collect_fallback' :
            await collectFallbackTaskHandler(context, event, callback);
            break;

        case 'fallback' :
            await fallbackHandler(context, event, callback);
            break;

        default :
            await fallbackHandler(context, event, callback);
    } 
};

//greeting handler function
const greetingTaskHandler = async (context, event, callback) => {

    const Say = 'Hi! Can you spare a few minutes to answer a few questions about your experience?',
          Listen = true,
          Collect = false,
          TaskFilter = ["start_survey", "goodbye"];

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

//start_survey handler function
const startSurveyTaskHandler = async (context, event, callback) => {

    const Say = `Thank you for making the time for this survey. Your answers help us improve the service!`,
          Listen = false,
          Collect = {
                "on_complete" : {
                    "redirect" : {
                        "method" : "POST",
                        "uri" : "task://complete_survey"
                    }
                },
                "name" : "csat_answers",
                "questions" : [
                    {
                        "type" : "Twilio.NUMBER",
                        "question" : "How likely are you to recommend our service on a scale of 1 to 10?",
                        "name" : "nps_score"
                    },
                    {
                        "question" : "Thanks! And what is the primary reason for your score?",
                        "name" : "nps_reason"
                    },
                    {
                        "type" : "Twilio.YES_NO",
                        "question" : "Do you want to participate in customer research sessions in the future?",
                        "name" : "research_yes_no"
                    }
                ]
            },
          TaskFilter = false;

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

//complete_survey handler function
const completeSurveyTaskHandler = async (context, event, callback) => {

    const {nps_score, nps_reason, research_yes_no} = JSON.parse(event.memory).twilio.collected_data.csat_answers.answers,
          Say = `Thank you so much for your time. If you answered yes to the last question, we'll reach out to schedule a customer research session with you. Goodbye!`,
          Listen = false,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

//goodbye handler function
const goodbyeTaskHandler = async (context, event, callback) => {

    const Say = "No worries. Please reach out if you want to take the survey in the future. Goodbye!",
          Listen = false,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

//collect_fallback handler function
const collectFallbackTaskHandler = async (context, event, callback) => {

    const Say = "Looks like you having trouble. Apologies for that. Let's start again, how can I help you today?",
          Listen = true,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

//fallback handler function
const fallbackHandler = async (context, event, callback) => {

    const Say = "I'm sorry didn't quite get that. Please say that again.",
          Listen = true,
          Collect = false,
          TaskFilter = false;

    speechOut(Say, Listen, Collect, TaskFilter, callback);
}

/** 
 * speech-out function 
 * @Say {string}             // message to speak out
 * @Listen {boolean}         // keep session true or false
 * @Remember {object}        // save data in remember object 
 * @callback {function}      // return twilio function response 
 * */ 
const speechOut = (Say, Listen, Collect, TaskFilter, callback) => {

    let responseObject = {
		"actions": []
    };

    if(Say)
        responseObject.actions.push(
            {
				"say": {
					"speech": Say
				}
			}
        );

    if(TaskFilter){
        responseObject.actions.push(
            {
                "listen" : {
                    "tasks" : TaskFilter
                }
            }
        )
    }

    if(Listen)
        responseObject.actions.push(
            { 
                "listen": true 
            }
        );

    if(Collect)
        responseObject.actions.push(
            {
                "collect" : Collect
            }
        );

    // return twilio function response
    callback(null, responseObject);
}