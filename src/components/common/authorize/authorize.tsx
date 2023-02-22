import React from "react";

type Props = {
    roles: Array<"Admin" | "Editor" | "Viewer">
    children: JSX.Element
}
const Authorize: React.FC<Props> = ({roles, children}) => {

    const role = 'Viewer'//useTypedSelector(i => i.user.userInfo?.role)

    // @ts-ignore
    return roles.includes(role) ? children : <section disabled>{children}</section>
}
export default Authorize