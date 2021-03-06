angular.filter.label = function(reaction) {
    if (reaction.text.length == 0 || reaction.text[0] == '') {
        return 'reaction with empty text';
    } else {
        return reaction.text[0];
    }

}

var id = 0;
function genId() {
    return "id"+(++id);
}
function quote(str) {
    if (!str) return '""';
    return '"'+str.replace(/\n/g,"\\n")+'"';
}

default_duration = '3.0f';
angular.filter.csharp = function(reactionsAndStuff) {
    var reactions = reactionsAndStuff.reactions;
    var code = '';
    var root = reactionsAndStuff.root_reaction_id;
    code += "public static TalkReactions "+ root + ";\n";
    code += "public static void Init"+root+"() {\n";
    code += root + " = new TalkReactions();\n";
    var ids = [];
    for (var i in reactions) {
        ids[i] = genId();
        code += "TalkReaction "+ids[i]+" = new TalkReaction();\n";
    }
 
    for (var i in reactionsAndStuff.root_reactions) {
	code += root + ".Reactions.Add(" + ids[reactionsAndStuff.root_reactions[i]] + ");\n";
    }
	

    for (var i in reactions) {
        var r = ids[i];

        for (var j in reactions[i].text) {
            code += r+'.Text.Add(new TalkText(' + quote(reactions[i].text[j]) + ',' + quote(reactions[i].sound[j]) + '));\n';

        }

        if (reactions[i].conditions) {
            code += r+ ".Conditions += ( () => "+ reactions[i].conditions + ");\n";
        }
        if (reactions[i].actions) {
            code += r+ ".Actions += ( () => "+ reactions[i].actions + ");\n";
        }

        for (var j in reactions[i].replies) {
            var reply = reactions[i].replies[j];
            var replyId = genId();
            code += 'TalkReply '+replyId + ' = new TalkReply();\n'
            code += r + '.Replies.Add(' + replyId + ');\n';

            if (reply.conditions) {
                code += replyId+ ".Conditions += ( () => "+ reply.conditions + ");\n";
            }
            if (reply.actions) {
                code += replyId+ ".Actions += ( () => "+ reply.actions + ");\n";
            }

            for (var t in reply.text) {
                code +=  replyId+'.Text.Add(new TalkText(' + quote(reply.text[t]) + ',' + quote(reply.sound[t]) + '));\n';
            }
            var reactionsId = genId();
            code += "TalkReactions "+reactionsId+" = new TalkReactions();\n";
            for (var h in reply.reactions) {
                code += reactionsId + ".Reactions.Add(" + ids[reply.reactions[h]] + ");\n";
            }
            code += replyId+".Response = "+reactionsId+";\n";
        }

    }
    code += "}\n"
    return code;
}


function ReactionController() {
}
ReactionController.prototype = {
    addText: function() {
        this.dialogue().reactions[this.selected_reaction].text.push("");
        this.dialogue().reactions[this.selected_reaction].sound.push("");
    },
    removeText: function(index) {
	this.dialogue().reactions[this.selected_reactions].text.splice(index,1);
	this.dialogue().reactions[this.selected_reactions].sound.splice(index,1);
    },
    addReply: function() {
        this.dialogue().reactions[this.selected_reaction].replies.push({text:[""],sound:[""],reactions:[]});
    },
    reaction: function() {
        if (this.dialogue().reactions.length) {
            return this.dialogue().reactions[this.selected_reaction];
        } else {
            return {};
        }
    }
};

angular.service('myApplication',function($resource) {
    this.res = $resource('/dialogue');
//    alert(this.res);
},{$inject:['$resource'],$creation:'eager'});

//angular.service('myApplication',function() { alert('there'); },{inject:[]});

function DialoguesController() {
}
DialoguesController.prototype = {
    addDialogue: function() {
        this.dialogues.push({reactions:[],selected_reaction:0,root_reactions:[],root_reaction_id:''})
    },
    dialogue: function() {
        if (this.dialogues.length) {
            return this.dialogues[this.selected_dialogue];
        } else {
            return {reactions:[],selected_reaction:0,root_reactions:[],root_reaction_id:''};
        }
    },
    allNPCTexts : function() {
        var result = []
        for (var i in this.dialogue().reactions) {
            var r = this.dialogue().reactions[i];
            for (var j in r.text) {
                result.push({soundArray:r.sound,textArray:r.text,index:j});
            }
        }
        return result;
    },
    allPlayerTexts : function() {
        var result = []
        for (var i in this.dialogue().reactions) {
            var reaction = this.dialogue().reactions[i];
            for (var j in reaction.replies) {
		var r = reaction.replies[j];
		for (var h in r.text) {
			result.push({soundArray:r.sound,textArray:r.text,index:h});
		}
            }
        }
        return result;
    },
    fetch: function() {
        var result;
        var scope = this;
        result = this.res.get(function() {
            scope.dialogues = result.dialogues;
	});
    },
    save: function() {
        console.debug(this.dialogues);
        this.res.save({dialogues:this.dialogues});
    },
    selectReaction: function(index) {
        scroll(0,0);
        this.selected_reaction = index;
    }
}

function ReactionsController() {
}
ReactionsController.prototype = {
    addReaction: function() {
        this.dialogue().reactions.push({
            text:[''],
            sound:[''],
            replies:[],
            action: '',
            conditions: ''
        });
    },
    addRootReaction: function() {
	console.debug(this.dialogue().root_reactions);
        this.dialogue().root_reactions.push(0);
    },
};

function ReplyController() {
}
ReplyController.prototype = {
    addReaction: function() {
        this.reply.reactions.push(0);
    },
    addText: function() {
        this.reply.text.push("");
        this.reply.sound.push("");
    },
    removeText: function() {
	this.reply.text.splice(index,1);
	this.reply.sound.splice(index,1);
   }
};

