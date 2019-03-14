const ApplicationPolicy = require("./application");

module.exports = class CollaboratorPolicy extends ApplicationPolicy {

    _isCollaborator() {
        return this.collaborator && (this.collaborator.userId == this.user.id);
    }

    showPrivate() {
        return this._isOwner() || this._isCollaborator();
    }

    show() {
        return this._isOwner() || this._isCollaborator();
    }

    edit() {
        return this.show();
    }

    update() {
        return this.edit();
    }

    destroy() {
        return this.update();
    }

}