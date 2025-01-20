import { MatchExpression } from "src/types/subscriptions";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { KeyValuePair, OptionType } from "src/types/common";
import { apiClient } from "src/client";
import ExpressionBranch from "src/components/Subscriptions/MatchExpressionEditor/ExpressionBranch";
import { getDescription } from "src/components/Subscriptions/MatchExpressionEditor/util";
import SyntaxHighlighter from "react-syntax-highlighter";
import { xcode } from "react-syntax-highlighter/dist/esm/styles/hljs";
import LeafNode from "./LeafNode";
const writeTerm = (expression: MatchExpression, operator: "and" | "or") => {
  return expression.type === operator
    ? `(${Description(expression)})`
    : `${Description(expression)}`;
};

const Description = (expression: MatchExpression) => {
  switch (expression.type) {
    case "and": {
      return `${writeTerm(expression.left, "or")} AND ${writeTerm(
        expression.right,
        "or"
      )}`;
    }
    case "or": {
      return `${writeTerm(expression.left, "and")} OR ${writeTerm(
        expression.right,
        "and"
      )}`;
    }
    case "one_of":
      return `${expression.path} IN (${expression.values.join(", ")})`;
    default:
      return `${expression.path} NOT IN (${expression.values.join(", ")})`;
  }
};

type Props = {
  expression: MatchExpression;
  documentId: string;
  onChange: (expression: MatchExpression) => void;
};

const MatchExpressionEditor: React.FC<Props> = ({
  expression,
  documentId,
  onChange,
}) => {
  const [promotedProperties, setPromotedProperties] = useState<Array<any>>([]);
  const [matchFeature, setMatchFeature] = useState(
    Boolean(expression) ?? false
  );
  const [documentName, setDocumentName] = useState<string>("DOCUMENT");
  const onChangeExpression = useCallback((e: MatchExpression) => {
    onChange(e);
  }, []);

  const loadData = async () => {
    if (!documentId) return;
    const data = await apiClient.findDocument(documentId);
    if (data.succeeded) {
      setDocumentName(data.data.name);
      const k = (data?.data?.promotedProperties as Array<KeyValuePair>).map(
        (i) => ({
          id: i.value,
          title: i.key,
        })
      ) as OptionType[];
      setPromotedProperties(k);
    }
  };
  useEffect(() => {
    loadData();
  }, [documentId]);

  const onClickAddNode = () => {
    const newExpression: MatchExpression = {
      left: null,
      right: expression,
      type: "and",
    };
    onChange(newExpression);
  };

  const isTreeFull = (expression: MatchExpression):boolean => {
    if(!expression)
        return false
    switch (expression.type) {
      case "and": {
        if (
          expression.left?.type === "one_of" ||
          expression.left?.type === "not_one_of"
        ) {
          if (
            expression.right?.type === "one_of" ||
            expression.right?.type === "not_one_of"
          ) {
             return (true);
          } else {
            return isTreeFull(expression.right);
          }
        } else {
          return isTreeFull(expression.left);
        }
      }
      case "or": {
        if (
          expression.left?.type === "one_of" ||
          expression.left?.type === "not_one_of"
        ) {
          if (
            expression.right?.type === "one_of" ||
            expression.right?.type === "not_one_of"
          ) {
             return (true);
             
          } else {
            return isTreeFull(expression.right);
          }
        } else {
          return isTreeFull(expression.left);
        }
      }

      default:
        break;
    }
  };

  return (
    <div className={"p-1 shadow-md rounded border bg-white"}>
      {!matchFeature && (
        <div className={"text-center bg-primary-50 py-3"}>
          <p>
            <span className={"font-semibold"}>Expression matching</span> is the
            new way to filter documents for internal type subscibtions Please{" "}
            <span
              onClick={() => {
                {
                  setMatchFeature(true);
                }
              }}
              className={
                "font-semibold underline cursor-pointer text-primary-800"
              }
            >
              Click
            </span>{" "}
            to enable it
          </p>
        </div>
      )}
      {isTreeFull(expression) && (
        <button
          className="cursor-pointer flex text-center flex items-center justify-center   text-white min-w-[80px] grow min-h-[30px] m-1   px-3 bg-green-600 shadow-md  text-md  rounded  hover:scale-105 hover:bg-green-500 transition  ease-in-out delay-100 "
          onClick={onClickAddNode}
        >
          Add Node
        </button>
      )}

      {matchFeature && (
        <Fragment>
          <div className={"text-center pt-2 pb-1"}>
            <SyntaxHighlighter wrapLines={true} language="sql" style={xcode}>
              {`SELECT * FROM "${documentName}" WHERE ${
                getDescription(expression) || "TRUE"
              } `}
            </SyntaxHighlighter>
          </div>

          <div className={"pr-8"}>
            <ExpressionBranch
              promotedProperties={promotedProperties}
              onChange={onChangeExpression}
              value={expression}
            />
          </div>
        </Fragment>
      )}
    </div>
  );
};
export default MatchExpressionEditor;
