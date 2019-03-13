module.exports = class ApplicationPolicy {

    constructor(user, record){
        this.user = user;
        this.record = record;
    }

    _isAdmin() {
        return this.user && this.user.role == 2;
    }

    _isPremium() {
        return this.user && this.user.role == 1;
    }

    new() {
        return this.user != null;
    }

    create() {
        return this.new();
    }

    show() {
        return true;
    }

    edit() {
        return this.new();
    }

    update() {
        return this.edit();
    }

    destroy() {
        return this.update();
    }

    private() {
        return (this._isAdmin() || this._isPremium());
    }

    _isOwner() {
        return this.record && (this.record.userId == this.user.id);
    }

    addCollaborator() {
        return this._isPremium() && this._isOwner();
    }

}