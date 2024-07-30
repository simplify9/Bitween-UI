export type Theme = {
    loginLogo: string;
    bitweenLogo: string;
    bitweenText: string;
    linkedinLink: string;
    githubLink: string;
    bitweenIcon: string;
    bitweenHeaderIcon: string;
    websiteLink: string;
    companyName: string;
    allRightsReserved: string;
    copyrightsIcon: string;
    tabTitle: string;
    tabIcon: string;
};

export type Config = {
    theme: Theme,
    msalClientId: string | null,
    msalRedirectUri: string | null,
    msalTenantId: string | null
}
