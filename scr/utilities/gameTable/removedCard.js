const removedCard = (teamOne, teamTwo, removedCard)=>{
	let userId;
	let AskTeamOrAloneId;

	for (let i = 0; i < teamOne.length; i++) {
		
		if(teamOne[i]?.isTrumpShow){
			AskTeamOrAloneId = teamOne[i]?.UserId;
		}

		if(teamOne[i]?.cards.length > 5){
            teamOne[i].cards = teamOne[i]?.cards.filter(e => e !== removedCard);
			userId = teamOne[i]?.UserId

			// break;
		}
    }
	for (let i = 0; i < teamTwo.length; i++) {

		if(teamTwo[i]?.isTrumpShow){
			AskTeamOrAloneId = teamTwo[i]?.UserId;
		}

		if(teamTwo[i]?.cards.length > 5){
            teamTwo[i].cards = teamTwo[i]?.cards.filter(e => e !== removedCard);
			userId = teamTwo[i]?.UserId

			// break;
		}
    }
	return {teamOne, teamTwo, userId, AskTeamOrAloneId};
};
module.exports =removedCard;